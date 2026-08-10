import { useState } from 'react';
import { ordersService } from '../../services/orders.service';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner, EmptyState } from '../../components/common';
import { MagnifyingGlassIcon, TruckIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import type { Order } from '../../types';

export const OrderTrackingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [orderNumber, setOrderNumber] = useState('');
  const [contactEmail, setContactEmail] = useState(isAuthenticated ? user?.email || '' : '');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setIsLoading(true);
    setError('');
    setOrder(null);

    try {
      const foundOrder = await ordersService.trackOrder(orderNumber.trim(), contactEmail.trim());
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setError('Order not found. Please check your order number and email and try again.');
      }
    } catch (err) {
      setError('An error occurred while searching for your order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-6 h-6" />;
      case 'confirmed':
      case 'processing':
        return <ClockIcon className="w-6 h-6" />;
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
        return 'bg-primary-600 text-white';
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
        return 'Failed';
      case 'refunded':
        return 'Refunded';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-4xl font-extrabold text-dark-900 uppercase tracking-wide mb-8">Track Your Order</h1>

          {/* Search Form */}
          <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-8 mb-8">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Enter your order number (e.g., MXC-XXX-XXX)"
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
          </div>

          {/* Order Details */}
          {order && (
            <div className="space-y-6">
              {/* Order Status Card */}
              <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-dark-900">{order.order_number}</h2>
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
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((step, index) => {
                      const currentIndex = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'].indexOf(order.status);
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
                        <span className={`font-semibold ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {getPaymentStatusText(order.payment_status)}
                        </span>
                      </div>
                      {order.payment_reference && (
                        <div className="flex justify-between">
                          <span className="text-metallic-600">Reference</span>
                          <span className="font-semibold">{order.payment_reference}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-8">
                <h3 className="font-bold text-dark-900 mb-4">Shipping Address</h3>
                <div className="text-metallic-700">
                  <p className="font-semibold text-dark-900">{order.shipping_address_line1}</p>
                  {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
                  <p>{order.shipping_city}, {order.shipping_state}</p>
                  <p>{order.shipping_country}</p>
                  {order.shipping_postal_code && <p>{order.shipping_postal_code}</p>}
                  {order.shipping_phone && <p className="mt-2">Phone: {order.shipping_phone}</p>}
                </div>
              </div>

              {/* Tracking Information */}
              {order.tracking_number && (
                <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-8">
                  <h3 className="font-bold text-dark-900 mb-4">Tracking Information</h3>
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
              <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-8">
                <h3 className="font-bold text-dark-900 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3 border-b border-metallic-200 last:border-0">
                      <div>
                        <p className="font-semibold text-dark-900">{item.product_name}</p>
                        <p className="text-sm text-metallic-600">Qty: {item.quantity} × ₦{item.unit_price.toLocaleString()}</p>
                      </div>
                      <span className="font-bold text-dark-900">₦{item.total_price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Notes */}
              {order.customer_notes && (
                <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-8">
                  <h3 className="font-bold text-dark-900 mb-4">Customer Notes</h3>
                  <p className="text-metallic-700">{order.customer_notes}</p>
                </div>
              )}
            </div>
          )}

          {!order && !isLoading && !error && (
            <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-12 text-center">
              <EmptyState
                title="Track Your Order"
                description="Enter your order number above to see the status of your order"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
