import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { customersService } from '../../services/customers.service';
import { ordersService } from '../../services/orders.service';
import { payWithPaystack, payWithFlutterwave, getGatewayStatus } from '../../services/payment.service';
import { uploadImage, STORAGE_BUCKETS } from '../../services/supabase';
import { Button } from '../../components/common';
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
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  // Order state
  const [placedSummary, setPlacedSummary] = useState<{
    orderNumber: string;
    items: { product_name: string; quantity: number; unit_price: number; total_price: number }[];
    subtotal: number;
    shippingCost: number;
    totalAmount: number;
    paymentMethod: string;
  } | null>(null);
  const [customerNotes, setCustomerNotes] = useState('');

  if (cart.length === 0 && step !== 'confirmation') {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-custom py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-display text-3xl lg:text-4xl font-extrabold uppercase tracking-wide text-ink mb-4">Your cart is empty</h1>
            <Button onClick={() => navigate('/shop')} size="lg" className="mt-4">
              Browse Products
            </Button>
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

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG or WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Receipt image must be less than 5MB');
      return;
    }

    setReceiptFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setReceiptPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const effectiveMethod = paymentMethod;

      // 0) Bank transfer requires a payment receipt proof
      let receipt: { path: string; url: string } | null = null;
      if (effectiveMethod === 'bank_transfer') {
        if (!receiptFile) {
          toast.error('Please upload your payment receipt before placing the order');
          return;
        }
        receipt = await uploadImage(STORAGE_BUCKETS.RECEIPTS, receiptFile, 'receipts');
        if (!receipt) {
          throw new Error('Could not upload your receipt. Please try again.');
        }
      }

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
          receipt,
        })) as unknown as Order;
      } else {
        if (!user || userType !== 'customer') {
          throw new Error('Please sign in to place your order');
        }
        order = await ordersService.createOrder(
          user.id,
          cart,
          addressSnapshot,
          effectiveMethod,
          customerNotes,
          receipt
        );
      }

      setPlacedSummary({
        orderNumber: order.order_number,
        items: cart.map((item) => ({
          product_name: item.product?.name || 'Unknown Product',
          quantity: item.quantity,
          unit_price: item.product?.price || 0,
          total_price: (item.product?.price || 0) * item.quantity,
        })),
        subtotal: cartTotal,
        shippingCost,
        totalAmount,
        paymentMethod: effectiveMethod,
      });

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
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold uppercase tracking-wide text-ink mb-8">Checkout</h1>

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
                  <Button size="lg" onClick={() => setStep('shipping')}>
                    Continue to Shipping
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex gap-4 mb-6">
                    <button
                      onClick={() => setAuthMode('login')}
                      className={`flex-1 py-2.5 rounded-lg font-semibold transition-colors border ${
                        authMode === 'login'
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-metallic-700 border-metallic-200 hover:border-primary-400'
                      }`}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setAuthMode('register')}
                      className={`flex-1 py-2.5 rounded-lg font-semibold transition-colors border ${
                        authMode === 'register'
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-metallic-700 border-metallic-200 hover:border-primary-400'
                      }`}
                    >
                      Register
                    </button>
                  </div>
                  <form onSubmit={handleAuth} className="space-y-4">
                    {authMode === 'register' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label" htmlFor="first_name">First Name</label>
                          <input
                            id="first_name"
                            type="text"
                            value={authForm.firstName}
                            onChange={(e) => setAuthForm({ ...authForm, firstName: e.target.value })}
                            className="input"
                            required
                          />
                        </div>
                        <div>
                          <label className="label" htmlFor="last_name">Last Name</label>
                          <input
                            id="last_name"
                            type="text"
                            value={authForm.lastName}
                            onChange={(e) => setAuthForm({ ...authForm, lastName: e.target.value })}
                            className="input"
                            required
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="label" htmlFor="checkout_email">Email</label>
                      <input
                        id="checkout_email"
                        type="email"
                        value={authForm.email}
                        onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor="checkout_password">Password</label>
                      <input
                        id="checkout_password"
                        type="password"
                        value={authForm.password}
                        onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                        className="input"
                        required
                      />
                    </div>
                    {authMode === 'register' && (
                      <div>
                        <label className="label" htmlFor="checkout_phone">Phone</label>
                        <input
                          id="checkout_phone"
                          type="tel"
                          value={authForm.phone}
                          onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                          className="input"
                        />
                      </div>
                    )}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      isLoading={isLoading}
                      className="w-full"
                      size="lg"
                    >
                      {authMode === 'login' ? 'Login' : 'Register'}
                    </Button>
                  </form>

                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-metallic-200" />
                    <span className="text-sm text-metallic-500 font-medium">or</span>
                    <div className="flex-1 h-px bg-metallic-200" />
                  </div>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => { setIsGuest(true); setStep('shipping'); }}
                    className="w-full !border-metallic-300 !text-ink hover:!bg-metallic-50"
                  >
                    Continue as Guest
                  </Button>
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
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-ink mb-6">Shipping Address</h2>
              <form onSubmit={handleShipping} className="space-y-4">
              {isGuest && (
                <div className="grid md:grid-cols-3 gap-4 p-4 bg-white rounded-xl border border-metallic-200">
                  <div>
                    <label className="label" htmlFor="guest_name">Full Name</label>
                    <input
                      id="guest_name"
                      type="text"
                      value={guestContact.name}
                      onChange={(e) => setGuestContact({ ...guestContact, name: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="guest_email">Email</label>
                    <input
                      id="guest_email"
                      type="email"
                      value={guestContact.email}
                      onChange={(e) => setGuestContact({ ...guestContact, email: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="guest_phone">Phone</label>
                    <input
                      id="guest_phone"
                      type="tel"
                      value={guestContact.phone}
                      onChange={(e) => setGuestContact({ ...guestContact, phone: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>
              )}
                <div>
                  <label className="label" htmlFor="address_line1">Address Line 1</label>
                  <input
                    id="address_line1"
                    type="text"
                    value={shippingForm.address_line1}
                    onChange={(e) => setShippingForm({ ...shippingForm, address_line1: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="address_line2">Address Line 2 (Optional)</label>
                  <input
                    id="address_line2"
                    type="text"
                    value={shippingForm.address_line2}
                    onChange={(e) => setShippingForm({ ...shippingForm, address_line2: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="city">City</label>
                    <input
                      id="city"
                      type="text"
                      value={shippingForm.city}
                      onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="state">State</label>
                    <input
                      id="state"
                      type="text"
                      value={shippingForm.state}
                      onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="postal_code">Postal Code</label>
                  <input
                    id="postal_code"
                    type="text"
                    value={shippingForm.postal_code}
                    onChange={(e) => setShippingForm({ ...shippingForm, postal_code: e.target.value })}
                    className="input"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  isLoading={isLoading}
                  size="lg"
                  className="w-full"
                >
                  Continue to Payment
                </Button>
              </form>
            </div>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <div className="bg-metallic-50 rounded-2xl p-8 border border-metallic-200">
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-ink mb-6">Payment Method</h2>
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
                      <span className="font-semibold text-ink">Pay on Delivery</span>
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
                      <span className="font-semibold text-ink">Paystack</span>
                      <p className="text-sm text-metallic-600">
                        {gatewayReady.paystack ? 'Pay securely with Paystack' : 'Card payments coming soon'}
                      </p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-4 bg-white rounded-xl border border-metallic-200 ${gatewayReady.flutterwave ? 'cursor-pointer hover:border-primary-600' : 'opacity-50 cursor-not-allowed'}`}>
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
                      <span className="font-semibold text-ink">Flutterwave</span>
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
                      <span className="font-semibold text-ink">Bank Transfer</span>
                      <p className="text-sm text-metallic-600">Transfer to our bank account</p>
                    </div>
                  </label>
                </div>

                {/* Bank Transfer Account Details */}
                {paymentMethod === 'bank_transfer' && (
                  <div className="bg-white rounded-xl border border-primary-200 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <h3 className="font-bold text-ink">Transfer To Any Of These Accounts</h3>
                    </div>
                    <p className="text-sm text-metallic-600 mb-4">
                      Transfer the total amount to either account below, then we'll confirm your order.
                    </p>
                    <div className="space-y-3">
                      {[
                        { bank: 'Opay', number: '9035777779', name: 'Olisaemeka Okafor' },
                        { bank: 'Access Bank', number: '1516838947', name: 'Mexcon Auto Resources' },
                      ].map((account) => (
                        <div key={account.number} className="flex items-center justify-between gap-4 p-3 rounded-lg border border-metallic-200 bg-metallic-50">
                          <div>
                            <p className="text-sm font-bold text-ink">{account.bank}</p>
                            <p className="font-mono text-lg font-black text-ink tracking-wider">{account.number}</p>
                            <p className="text-xs text-metallic-600">{account.name}</p>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(account.number);
                                toast.success(`${account.number} copied`);
                              } catch {
                                toast.error('Could not copy account number');
                              }
                            }}
                            className="text-primary-600 text-sm font-semibold hover:underline flex-shrink-0"
                          >
                            Copy
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Receipt Upload */}
                    <div className="mt-4 p-4 rounded-lg border border-dashed border-primary-400 bg-primary-50">
                      <p className="text-sm font-bold text-ink mb-1">Upload Payment Receipt *</p>
                      <p className="text-xs text-metallic-600 mb-3">
                        After transferring, upload the receipt (screenshot or photo) so we can confirm your payment.
                      </p>
                      <div className="flex items-start gap-4">
                        {receiptPreview && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-white ring-1 ring-black/5 flex-shrink-0">
                            <img src={receiptPreview} alt="Receipt preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleReceiptChange}
                            className="block w-full text-sm text-metallic-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-lg file:border-0
                              file:text-sm file:font-medium
                              file:bg-white file:text-primary-700
                              hover:file:bg-primary-100
                              cursor-pointer"
                          />
                          <p className="text-xs text-metallic-500 mt-1">PNG, JPG, WebP up to 5MB</p>
                        </div>
                        {receiptPreview && (
                          <button
                            type="button"
                            onClick={() => {
                              setReceiptFile(null);
                              setReceiptPreview(null);
                            }}
                            className="text-red-600 text-sm font-semibold hover:underline flex-shrink-0"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="mt-6 p-4 bg-white rounded-xl border border-metallic-200">
                  <h3 className="font-display font-bold uppercase tracking-wide text-ink mb-3">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-metallic-700">
                      <span>Subtotal</span>
                      <span>₦{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-metallic-700">
                      <span>Shipping</span>
                      <span>₦{shippingCost.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-metallic-300 pt-2 flex justify-between text-ink font-black text-lg">
                      <span>Total</span>
                      <span>₦{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Order Notes */}
                <div>
                  <label className="label" htmlFor="order_notes">Order Notes (Optional)</label>
                  <textarea
                    id="order_notes"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    rows={3}
                    placeholder="Any special instructions for delivery?"
                    className="input"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  isLoading={isLoading}
                  size="lg"
                  className="w-full"
                >
                  Place Order
                </Button>
              </form>
            </div>
          )}

          {/* Confirmation Step */}
          {step === 'confirmation' && placedSummary && (
            <div className="max-w-3xl mx-auto">
              {/* Success Hero */}
              <div className="card p-8 lg:p-10 text-center mb-6">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="font-display text-3xl font-extrabold uppercase tracking-wide text-ink mb-2">
                  Order Placed Successfully!
                </h2>
                <p className="text-metallic-700">
                  {placedSummary.paymentMethod === 'bank_transfer'
                    ? 'Thank you — we received your payment receipt and will confirm your payment shortly.'
                    : 'Thank you — your order is confirmed and a receipt is on its way to your email.'}
                </p>
                <p className="mt-4 text-sm text-metallic-600">
                  Order number:{' '}
                  <span className="font-mono font-bold text-ink text-base">{placedSummary.orderNumber}</span>
                </p>
              </div>

              {/* Order Summary */}
              <div className="card p-8 mb-6">
                <h3 className="font-display text-xl font-bold uppercase tracking-wide text-ink mb-4">Your Order</h3>
                <div className="space-y-3">
                  {placedSummary.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-metallic-200 last:border-0">
                      <div>
                        <p className="font-semibold text-ink">{item.product_name}</p>
                        <p className="text-sm text-metallic-600">Qty: {item.quantity} × ₦{item.unit_price.toLocaleString()}</p>
                      </div>
                      <span className="font-bold text-ink">₦{item.total_price.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-metallic-600">Subtotal</span>
                      <span className="font-semibold text-ink">₦{placedSummary.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-metallic-600">Shipping</span>
                      <span className="font-semibold text-ink">₦{placedSummary.shippingCost.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-metallic-300 pt-2 flex justify-between text-ink font-black text-lg">
                      <span>Total</span>
                      <span>₦{placedSummary.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-metallic-600">Payment Method</span>
                      <span className="font-semibold capitalize text-ink">{placedSummary.paymentMethod.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* What happens next */}
              <div className="card p-8 mb-8">
                <h3 className="font-display text-xl font-bold uppercase tracking-wide text-ink mb-4">What Happens Next</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                    <p className="text-metallic-700">
                      <span className="font-semibold text-ink">Order confirmed</span> — we received your order and are preparing it for dispatch.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                    <p className="text-metallic-700">
                      <span className="font-semibold text-ink">Tracking updates</span> — use your order number on the tracking page to see progress.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                    <p className="text-metallic-700">
                      <span className="font-semibold text-ink">Delivery</span> — pay on delivery or as selected at checkout.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate(`/track-order?order=${encodeURIComponent(placedSummary.orderNumber)}`)}
                  size="lg"
                >
                  Track My Order
                </Button>
                <Button variant="outline" onClick={() => navigate('/shop')} size="lg">
                  Continue Shopping
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
