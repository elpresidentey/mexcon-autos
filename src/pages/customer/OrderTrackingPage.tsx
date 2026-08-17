import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ordersService } from '../../services/orders.service';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner, EmptyState } from '../../components/common';
import { MagnifyingGlassIcon, TruckIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import type { Order } from '../../types';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'shipped':
      return <TruckIcon className="w-6 h-6" />;
    case 'delivered':
      return <CheckCircleIcon className="w-6 h-6" />;
    case 'cancelled':
      return <XCircleIcon className="w-6 h-6" />;
    default:
      return <ClockIcon className="w-6 h-6" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
    case 'confirmed':
      return 'bg-primary-600 text-white';
    case 'processing':
      return 'bg-primary-700 text-white';
    case 'shipped':
      return 'bg-accent-500 text-black';
    case 'delivered':
      return 'bg-green-600 text-white';
    case 'cancelled':
      return 'bg-red-500 text-white';
    default:
      return 'bg-metallic-500 text-white';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'confirmed':
      return 'Confirmed';
    case 'processing':
      return 'Processing';
    case 'shipped':
      return 'Shipped';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

const getPaymentStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'paid':
      return 'Paid';
    case 'failed':
      return 'Rejected';
    case 'refunded':
      return 'Refunded';
    default:
      return status;
  }
};

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

// Order stored in this session after checkout (guests land here with
// order number + email pre-filled so tracking is one click away).
const getStoredOrderInfo = (): { orderNumber: string; email: string; receiptUrl?: string } | null => {
  try {
    const raw = sessionStorage.getItem('mexcon_last_order');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const OrderCard = ({ order }: { order: Order }) => (
  <div className="space-y-6">
    {/* Order Status Card */}
    <div className="card p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-wide text-ink">{order.order_number}</h2>
          <p className="text-metallic-600">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          <span className="font-semibold">{getStatusText(order.status)}</span>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-metallic-200 -translate-y-1/2" />
          {STATUS_STEPS.map((step, index) => {
            const currentIndex = STATUS_STEPS.indexOf(order.status);
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step} className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-primary-600 text-white' : 'bg-metallic-200 text-metallic-500'}`}>
                  {isCompleted ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                <span className={`text-xs font-semibold mt-2 ${isCurrent ? 'text-primary-600' : 'text-metallic-500'}`}>
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold text-dark-900 mb-3">Order Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-metallic-600">Subtotal</span>
              <span className="font-semibold">₦{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-metallic-600">Shipping</span>
              <span className="font-semibold">₦{order.shipping_cost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-metallic-600">Tax</span>
              <span className="font-semibold">₦{order.tax_amount.toLocaleString()}</span>
            </div>
            <div className="border-t border-metallic-300 pt-2 flex justify-between text-dark-900 font-black">
              <span>Total</span>
              <span>₦{order.total_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-dark-900 mb-3">Payment Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-metallic-600">Payment Method</span>
              <span className="font-semibold capitalize">{order.payment_method?.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-metallic-600">Payment Status</span>
              <span className={`font-semibold ${order.payment_status === 'paid' ? 'text-green-600' : order.payment_status === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}>
                {getPaymentStatusText(order.payment_status)}
              </span>
            </div>
            {order.payment_reference && (
              <div className="flex justify-between">
                <span className="text-metallic-600">Reference</span>
                <span className="font-semibold">{order.payment_reference}</span>
              </div>
            )}
            {order.receipt_url && (
              <div className="flex justify-between items-center gap-4">
                <span className="text-metallic-600">Payment Receipt</span>
                <a href={order.receipt_url} target="_blank" rel="noopener noreferrer" title="View full receipt">
                  <img
                    src={order.receipt_url}
                    alt="Payment receipt"
                    className="w-20 h-20 object-cover rounded-lg border border-metallic-200 hover:opacity-80 transition-opacity"
                  />
                </a>
              </div>
            )}
            {order.payment_verified_at && (
              <div className="flex justify-between">
                <span className="text-metallic-600">Payment Confirmed</span>
                <span className="font-semibold text-green-600">{new Date(order.payment_verified_at).toLocaleDateString()}</span>
              </div>
            )}
            {order.payment_note && (
              <div className="flex justify-between">
                <span className="text-metallic-600">Note</span>
                <span className="font-semibold text-red-600 text-right">{order.payment_note}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Shipping Address */}
    <div className="card p-8">
      <h3 className="font-display text-lg font-bold uppercase tracking-wide text-ink mb-4">Shipping Address</h3>
      <div className="text-metallic-700">
        <p className="font-semibold text-ink">{order.shipping_address_line1}</p>
        {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
        <p>{order.shipping_city}, {order.shipping_state}</p>
        <p>{order.shipping_country}</p>
        {order.shipping_postal_code && <p>{order.shipping_postal_code}</p>}
        {order.shipping_phone && <p className="mt-2">Phone: {order.shipping_phone}</p>}
      </div>
    </div>

    {/* Tracking Information */}
    {order.tracking_number && (
      <div className="card p-8">
        <h3 className="font-display text-lg font-bold uppercase tracking-wide text-ink mb-4">Tracking Information</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-metallic-600">Tracking Number</span>
            <span className="font-semibold">{order.tracking_number}</span>
          </div>
          {order.tracking_url && (
            <a
              href={order.tracking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 font-semibold hover:text-primary-700"
            >
              Track with Courier →
            </a>
          )}
        </div>
      </div>
    )}

    {/* Order Items */}
    <div className="card p-8">
      <h3 className="font-display text-lg font-bold uppercase tracking-wide text-ink mb-4">Order Items</h3>
      <div className="space-y-4">
        {order.items?.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-3 border-b border-metallic-200 last:border-0">
            <div>
              <p className="font-semibold text-ink">{item.product_name}</p>
              <p className="text-sm text-metallic-600">Qty: {item.quantity} × ₦{item.unit_price.toLocaleString()}</p>
            </div>
            <span className="font-bold text-ink">₦{item.total_price.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Customer Notes */}
    {order.customer_notes && (
      <div className="card p-8">
        <h3 className="font-display text-lg font-bold uppercase tracking-wide text-ink mb-4">Customer Notes</h3>
        <p className="text-metallic-700">{order.customer_notes}</p>
      </div>
    )}
  </div>
);

export const OrderTrackingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const orderParam = searchParams.get('order');
  const [mode, setMode] = useState<'order' | 'product'>('order');
  const [orderNumber, setOrderNumber] = useState(() => orderParam ?? getStoredOrderInfo()?.orderNumber ?? '');
  const [productNumber, setProductNumber] = useState('');
  const [contactEmail, setContactEmail] = useState(
    () => isAuthenticated ? user?.email || '' : (getStoredOrderInfo()?.email || '')
  );
  const [order, setOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-search when arriving with ?order=... (e.g. from order history or
  // the checkout confirmation). Guests use the email stored at checkout.
  useEffect(() => {
    if (!orderParam) return;
    const email = user?.email || getStoredOrderInfo()?.email;
    if (!email) return;

    let cancelled = false;
    ordersService
      .trackOrder(orderParam, email)
      .then((foundOrder) => {
        if (cancelled) return;
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError('Order not found. Please check your order number and email and try again.');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('An error occurred while searching for your order. Please try again.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [orderParam, user?.email]);

  const needsEmailToAutoSearch = orderParam !== null && !user?.email && !getStoredOrderInfo()?.email;

  const switchMode = (next: 'order' | 'product') => {
    setMode(next);
    setError('');
    setOrder(null);
    setOrders([]);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = mode === 'order' ? orderNumber.trim() : productNumber.trim();
    if (!query) return;

    setIsLoading(true);
    setError('');
    setOrder(null);
    setOrders([]);

    try {
      if (mode === 'order') {
        const foundOrder = await ordersService.trackOrder(query, contactEmail.trim());
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError('Order not found. Please check your order number and email and try again.');
        }
      } else {
        const foundOrders = await ordersService.trackOrdersByProduct(query, contactEmail.trim());
        if (foundOrders.length > 0) {
          setOrders(foundOrders);
        } else {
          setError('No orders found for that product number. Please check the number and your email and try again.');
        }
      }
    } catch {
      setError('An error occurred while searching for your order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const searchPlaceholder = mode === 'order'
    ? 'Enter your order number (e.g., MXC-XXX-XXX)'
    : 'Enter the product / part / OEM number';

  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-4xl font-extrabold text-dark-900 uppercase tracking-wide mb-8">Track Your Order</h1>

          {/* Search Mode Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => switchMode('order')}
              className={`px-5 py-2.5 text-sm font-semibold rounded-full border transition-colors ${
                mode === 'order'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-metallic-700 border-metallic-200 hover:border-primary-400'
              }`}
            >
              By Order Number
            </button>
            <button
              type="button"
              onClick={() => switchMode('product')}
              className={`px-5 py-2.5 text-sm font-semibold rounded-full border transition-colors ${
                mode === 'product'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-metallic-700 border-metallic-200 hover:border-primary-400'
              }`}
            >
              By Product Number
            </button>
          </div>

          {/* Search Form */}
          <div className="card p-8 mb-8">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={mode === 'order' ? orderNumber : productNumber}
                  onChange={(e) => (mode === 'order' ? setOrderNumber(e.target.value) : setProductNumber(e.target.value))}
                  placeholder={searchPlaceholder}
                  className="input"
                />
              </div>
              <div className="flex-1">
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Enter the email used at checkout"
                  className="input"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary md:self-start px-6 flex items-center gap-2"
              >
                {isLoading ? <LoadingSpinner /> : (
                  <>
                    <MagnifyingGlassIcon className="w-5 h-5" />
                    Track Order
                  </>
                )}
              </button>
            </form>
            {error && (
              <p className="mt-4 text-red-600 font-medium">{error}</p>
            )}
            {needsEmailToAutoSearch && (
              <p className="mt-4 text-sm text-metallic-600">
                Viewing order <span className="font-semibold text-dark-900">{orderNumber}</span> — sign in or
                enter the email used at checkout to see it.
              </p>
            )}
          </div>

          {/* Order Details */}
          {order && <OrderCard order={order} />}

          {/* Multiple orders found by product number */}
          {orders.length > 0 && (
            <div className="space-y-10">
              <p className="text-metallic-600">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} found for this product number.
              </p>
              {orders.map((found) => (
                <OrderCard key={found.id} order={found} />
              ))}
            </div>
          )}

          {!order && orders.length === 0 && !isLoading && !error && (
            <div className="card p-12 text-center">
              <EmptyState
                title="Track Your Order"
                description="Enter your order number or product number above to see the status of your order"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;