import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { customersService } from '../../services/customers.service';
import { ordersService } from '../../services/orders.service';
import { payWithPaystack, payWithFlutterwave, getGatewayStatus } from '../../services/payment.service';
import { LoadingSpinner } from '../../components/common';
import type { CustomerAddressFormData, Order } from '../../types';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated, userType, customerRegister, customerLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'auth' | 'shipping' | 'payment' | 'confirmation'>('auth');

  // Auth form state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  // Guest checkout state
  const [isGuest, setIsGuest] = useState(false);
  const [guestContact, setGuestContact] = useState({ name: '', email: '', phone: '' });

  // Shipping form state
  const [shippingForm, setShippingForm] = useState<CustomerAddressFormData>({
    address_type: 'both',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Nigeria',
    is_default: true,
  });

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'flutterwave' | 'bank_transfer' | 'pay_on_delivery'>('pay_on_delivery');
  const gatewayReady = getGatewayStatus();

  // Order state
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [customerNotes, setCustomerNotes] = useState('');

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-custom py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-black text-dark-900 mb-4">Your cart is empty</h1>
            <button
              onClick={() => navigate('/shop')}
              className="mt-4 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (authMode === 'register') {
        await customerRegister(
          authForm.email,
          authForm.password,
          authForm.firstName,
          authForm.lastName,
          authForm.phone
        );
      } else {
        await customerLogin(authForm.email, authForm.password);
      }
      setStep('shipping');
    } catch (error) {
      const rawMessage =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: unknown }).message)
          : error instanceof Error
            ? error.message
            : '';
      console.error('Auth error:', error);

      if (rawMessage.toLowerCase().includes('already exists')) {
        setAuthMode('login');
        toast.error('An account already exists for this email. Switch to Login and enter your password.');
      } else {
        toast.error(rawMessage || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Save shipping address for the customer (best-effort, address is
      // also snapshotted onto the order row itself)
      if (user && userType === 'customer') {
        try {
          await customersService.createCustomerAddress(user.id, shippingForm);
        } catch (addressError) {
          console.warn('Address save skipped (continuing checkout):', addressError);
        }
      }
      setStep('payment');
    } catch (error) {
      console.error('Shipping error:', error);
      toast.error('Failed to save shipping address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const effectiveMethod = paymentMethod;

      // 1) Create the order (dataset different for guests vs logged-in buyers)
      let order: Order;
      const addressSnapshot = {
        address_line1: shippingForm.address_line1,
        address_line2: shippingForm.address_line2,
        city: shippingForm.city,
        state: shippingForm.state,
        postal_code: shippingForm.postal_code,
        country: shippingForm.country || 'Nigeria',
        phone: isGuest ? guestContact.phone : (user as any)?.phone,
      };

      if (isGuest) {
        order = (await ordersService.createGuestOrder({
          items: cart.map((item) => ({
            product_id: item.product_id,
            product_name: item.product?.name || 'Unknown Product',
            product_sku: item.product?.part_number,
            quantity: item.quantity,
            unit_price: item.product?.price || 0,
            total_price: (item.product?.price || 0) * item.quantity,
          })),
          paymentMethod: effectiveMethod,
          subtotal: cartTotal,
          shippingCost,
          totalAmount,
          shippingAddress: addressSnapshot,
          customerName: guestContact.name,
          customerEmail: guestContact.email,
          customerNotes,
        })) as unknown as Order;
        setPlacedOrder(order);
      } else {
        if (!user || userType !== 'customer') {
          throw new Error('Please sign in to place your order');
        }
        order = await ordersService.createOrder(
          user.id,
          cart,
          addressSnapshot,
          effectiveMethod,
          customerNotes
        );
        setPlacedOrder(order);
      }

      // 2) If a card gateway was chosen: route to the gateway popup, then
      //    mark the order paid on a successful callback.
      if (paymentMethod === 'paystack') {
        const reference = await payWithPaystack({
          email: isGuest ? guestContact.email : (user?.email || ''),
          amountNaira: totalAmount,
          reference: order.order_number,
        });
        await ordersService.updatePaymentStatus(order.id, 'paid', reference);
      } else if (paymentMethod === 'flutterwave') {
        const reference = await payWithFlutterwave({
          email: isGuest ? guestContact.email : (user?.email || ''),
          amountNaira: totalAmount,
          reference: order.order_number,
        });
        await ordersService.updatePaymentStatus(order.id, 'paid', reference);
      }

      await clearCart();
      toast.success(
        `Order ${order.order_number} placed successfully! We'll email you the confirmation shortly.`,
        { duration: 6000 }
      );
      setStep('confirmation');
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to place order. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const shippingCost = 2000; // Fixed shipping cost for MVP
  const totalAmount = cartTotal + shippingCost;

  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl lg:text-4xl font-black text-dark-900 mb-8">Checkout</h1>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            <div className={`flex items-center gap-2 ${step === 'auth' ? 'text-primary-600' : 'text-metallic-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 'auth' ? 'bg-primary-600 text-white' : 'bg-metallic-200'}`}>
                1
              </div>
              <span className="font-semibold">Account</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step === 'auth' ? 'bg-metallic-200' : 'bg-primary-600'}`} />
            <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-primary-600' : step === 'auth' ? 'text-metallic-400' : 'text-primary-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 'shipping' ? 'bg-primary-600 text-white' : step === 'auth' ? 'bg-metallic-200' : 'bg-primary-600 text-white'}`}>
                2
              </div>
              <span className="font-semibold">Shipping</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step === 'payment' || step === 'confirmation' ? 'bg-primary-600' : 'bg-metallic-200'}`} />
            <div className={`flex items-center gap-2 ${step === 'payment' || step === 'confirmation' ? 'text-primary-600' : 'text-metallic-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 'payment' || step === 'confirmation' ? 'bg-primary-600 text-white' : 'bg-metallic-200'}`}>
                3
              </div>
              <span className="font-semibold">Payment</span>
            </div>
          </div>

          {/* Auth Step */}
          {step === 'auth' && (
            <div className="bg-metallic-50 rounded-2xl p-8 border border-metallic-200">
              {isAuthenticated && userType === 'customer' ? (
                <div className="text-center">
                  <p className="text-lg text-metallic-700 mb-4">Welcome back, {(user as any)?.first_name || user?.email}!</p>
                  <button
                    onClick={() => setStep('shipping')}
                    className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors"
                  >
                    Continue to Shipping
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-4 mb-6">
                    <button
                      onClick={() => setAuthMode('login')}
                      className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${authMode === 'login' ? 'bg-primary-600 text-white' : 'bg-white text-metallic-700'}`}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setAuthMode('register')}
                      className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${authMode === 'register' ? 'bg-primary-600 text-white' : 'bg-white text-metallic-700'}`}
                    >
                      Register
                    </button>
                  </div>
                  <form onSubmit={handleAuth} className="space-y-4">
                    {authMode === 'register' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-dark-900 mb-1">First Name</label>
                          <input
                            type="text"
                            value={authForm.firstName}
                            onChange={(e) => setAuthForm({ ...authForm, firstName: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-metallic-200 focus:outline-none focus:ring-2 focus:ring-primary-600"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-dark-900 mb-1">Last Name</label>
                          <input
                            type="text"
                            value={authForm.lastName}
                            onChange={(e) => setAuthForm({ ...authForm, lastName: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-metallic-200 focus:outline-none focus:ring-2 focus:ring-primary-600"
                            required
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-dark-900 mb-1">Email</label>
                      <input
                        type="email"
                        value={authForm.email}
                        onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-metallic-200 focus:outline-none focus:ring-2 focus:ring-primary-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-dark-900 mb-1">Password</label>
                      <input
                        type="password"
                        value={authForm.password}
                        onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-metallic-200 focus:outline-none focus:ring-2 focus:ring-primary-600"
                        required
                      />
                    </div>
                    {authMode === 'register' && (
                      <div>
                        <label className="block text-sm font-semibold text-dark-900 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={authForm.phone}
                          onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-metallic-200 focus:outline-none focus:ring-2 focus:ring-primary-600"
                        />
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? <LoadingSpinner /> : authMode === 'login' ? 'Login' : 'Register'}
                    </button>
                  </form>

                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-metallic-200" />
                    <span className="text-sm text-metallic-500 font-medium">or</span>
                    <div className="flex-1 h-px bg-metallic-200" />
                  </div>

                  <button
                    onClick={() => { setIsGuest(true); setStep('shipping'); }}
                    className="w-full bg-white text-dark-900 px-6 py-3 rounded-xl font-bold border border-metallic-200 hover:bg-metallic-50 transition-colors"
                  >
                    Continue as Guest
                  </button>
                  <p className="mt-3 text-xs text-metallic-500 text-center">
                    No account needed — you can track your order with your email and order number.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Shipping Step */}
          {step === 'shipping' && (
            <div className="bg-metallic-50 rounded-2xl p-8 border border-metallic-200">
              <h2 className="text-2xl font-black text-dark-900 mb-6">Shipping Address</h2>
              <form onSubmit={handleShipping} className="space-y-4">
              {isGuest && (
                <div className="grid md:grid-cols-3 gap-4 p-4 bg-white rounded-xl border border-metallic-200">
                  <div>
                    <label className="block text-sm font-semibold text-dark-900 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={guestContact.name}
                      onChange={(e) => setGuestContact({ ...guestContact, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-metallic-200 focus:outline-none focus:ring-2 focus:ring-primary-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark-900 mb-1">Email</label>
                    <input
                      type="email"
                      value={guestContact.email}
                      onChange={(e) => setGuestContact({ ...guestContact, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-metallic-200 focus:outline-none focus:ring-2 focus:ring-primary-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark-900 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={guestContact.phone}
                      onChange={(e) => setGuestContact({ ...guestContact, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-metallic-200 focus:outline-none focus:ring-2 focus:ring-primary-600"
                      required
                    />
                  </div>
                </div>
              )}
                <div>
                  <label className="block text-sm font-semibold text-dark-900 mb-1">Address Line 1</label>
                  <input
                    type="text"
                    value={shippingForm.address_line1}
                    onChange={(e) => setShippingForm({ ...shippingForm, address_line1: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-metallic-200 focus:outline-none focus:ring-2 focus:ring-primary-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-900 mb-1">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    value={shippingForm.address_line2}
                    onChange={(e) => setShippingForm({ ...shippingForm, address_line2: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-metallic-200 focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-dark-900 mb-1">City</label>
                    <input
                      type="text"
                      value={shippingForm.city}
                      onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-metallic-200 focus:outline-none focus:ring-2 focus:ring-primary-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark-900 mb-1">State</label>
                    <input
                      type="text"
                      value={shippingForm.state}
                      onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-metallic-200 focus:outline-none focus:ring-2 focus:ring-primary-600"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-900 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={shippingForm.postal_code}
                    onChange={(e) => setShippingForm({ ...shippingForm, postal_code: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-metallic-200 focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? <LoadingSpinner /> : 'Continue to Payment'}
                </button>
              </form>
            </div>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <div className="bg-metallic-50 rounded-2xl p-8 border border-metallic-200">
              <h2 className="text-2xl font-black text-dark-900 mb-6">Payment Method</h2>
              {!gatewayReady.paystack && !gatewayReady.flutterwave && (
                <p className="mb-4 p-3 bg-accent-50 text-accent-700 text-sm rounded-lg border border-accent-200">
                  Card payments are coming soon — please use Bank Transfer or Pay on Delivery for now.
                </p>
              )}
              <form onSubmit={handlePayment} className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 bg-white rounded-xl border border-metallic-200 cursor-pointer hover:border-primary-600 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="pay_on_delivery"
                      checked={paymentMethod === 'pay_on_delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-5 h-5 text-primary-600"
                    />
                    <div>
                      <span className="font-semibold text-dark-900">Pay on Delivery</span>
                      <p className="text-sm text-metallic-600">Pay cash when your order arrives</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-4 bg-white rounded-xl border border-metallic-200 transition-colors ${gatewayReady.paystack ? 'cursor-pointer hover:border-primary-600' : 'opacity-50 cursor-not-allowed'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="paystack"
                      checked={paymentMethod === 'paystack'}
                      disabled={!gatewayReady.paystack}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-5 h-5 text-primary-600"
                    />
                    <div>
                      <span className="font-semibold text-dark-900">Paystack</span>
                      <p className="text-sm text-metallic-600">
                        {gatewayReady.paystack ? 'Pay securely with Paystack' : 'Card payments coming soon'}
                      </p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-4 bg-white rounded-xl border border-metallic-200 cursor-pointer ${gatewayReady.flutterwave ? 'cursor-pointer hover:border-primary-600' : 'opacity-50 cursor-not-allowed'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="flutterwave"
                      checked={paymentMethod === 'flutterwave'}
                      disabled={!gatewayReady.flutterwave}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-5 h-5 text-primary-600"
                    />
                    <div>
                      <span className="font-semibold text-dark-900">Flutterwave</span>
                      <p className="text-sm text-metallic-600">
                        {gatewayReady.flutterwave ? 'Pay securely with Flutterwave' : 'Card payments coming soon'}
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-white rounded-xl border border-metallic-200 cursor-pointer hover:border-primary-600 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-5 h-5 text-primary-600"
                    />
                    <div>
                      <span className="font-semibold text-dark-900">Bank Transfer</span>
                      <p className="text-sm text-metallic-600">Transfer to our bank account</p>
                    </div>
                  </label>
                </div>

                {/* Order Summary */}
                <div className="mt-6 p-4 bg-white rounded-xl border border-metallic-200">
                  <h3 className="font-bold text-dark-900 mb-3">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-metallic-700">
                      <span>Subtotal</span>
                      <span>₦{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-metallic-700">
                      <span>Shipping</span>
                      <span>₦{shippingCost.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-metallic-300 pt-2 flex justify-between text-dark-900 font-black text-lg">
                      <span>Total</span>
                      <span>₦{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Order Notes */}
                <div>
                  <label className="block text-sm font-semibold text-dark-900 mb-1">Order Notes (Optional)</label>
                  <textarea
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    rows={3}
                    placeholder="Any special instructions for delivery?"
                    className="w-full px-4 py-3 rounded-xl border border-metallic-200 focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? <LoadingSpinner /> : 'Place Order'}
                </button>
              </form>
            </div>
          )}

          {/* Confirmation Step */}
          {step === 'confirmation' && (
            <div className="bg-metallic-50 rounded-2xl p-8 border border-metallic-200 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-dark-900 mb-2">Order Placed Successfully!</h2>
              <p className="text-metallic-700 mb-2">Thank you for your order. You will receive an email confirmation shortly.</p>
              {placedOrder && (
                <p className="text-metallic-700 mb-6">
                  Your order number is{' '}
                  <span className="font-bold text-dark-900">{placedOrder.order_number}</span> — you can
                  track it{' '}
                  {isGuest ? (
                    <button
                      onClick={() => navigate('/track-order')}
                      className="text-primary-600 font-semibold hover:underline"
                    >
                      here
                    </button>
                  ) : (
                    <>
                      in{' '}
                      <button
                        onClick={() => navigate('/account')}
                        className="text-primary-600 font-semibold hover:underline"
                      >
                        My Account
                      </button>
                    </>
                  )}
                  .
                </p>
              )}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate(isGuest ? '/track-order' : '/account')}
                  className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors"
                >
                  {isGuest ? 'Track My Order' : 'View My Orders'}
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="bg-white text-dark-900 px-6 py-3 rounded-xl font-bold border border-metallic-200 hover:bg-metallic-50 transition-colors"
                >
                  Return to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
