import { useState, useEffect, useCallback } from 'react';
import { ordersService } from '../../services/orders.service';
import { getSignedUrl, STORAGE_BUCKETS } from '../../services/supabase';
import type { Order } from '../../types';
import {
  Button,
  Card,
  SearchBar,
  Select,
  Pagination,
  LoadingSpinner,
  Badge,
  EmptyState,
  Modal,
} from '../../components/common';
import {
  CheckBadgeIcon,
  XCircleIcon,
  EyeIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const orderStatusBadge: Record<string, 'warning' | 'info' | 'primary' | 'success' | 'error' | 'secondary'> = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'primary',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'secondary',
};

const paymentStatusBadge: Record<string, 'warning' | 'success' | 'error' | 'secondary'> = {
  pending: 'warning',
  paid: 'success',
  failed: 'error',
  refunded: 'secondary',
};

const ORDER_STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: '', label: 'All payments' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(price);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [receiptSignedUrl, setReceiptSignedUrl] = useState<string | null>(null);

  // Receipts live in a private bucket: mint a short-lived signed URL for the
  // selected order's proof of payment (admins hold SELECT via RLS).
  useEffect(() => {
    let cancelled = false;
    setReceiptSignedUrl(null);
    const path = selectedOrder?.receipt_path;
    if (selectedOrder && path) {
      getSignedUrl(STORAGE_BUCKETS.RECEIPTS, path, 600).then((url) => {
        if (!cancelled) setReceiptSignedUrl(url);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [selectedOrder]);
  const [isUpdating, setIsUpdating] = useState(false);
  const perPage = 10;

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, total } = await ordersService.getOrders(
        {
          search: searchTerm || undefined,
          status: statusFilter || undefined,
          paymentStatus: paymentFilter || undefined,
        },
        { page: currentPage, perPage }
      );
      setOrders(data);
      setTotalCount(total);
      setTotalPages(Math.ceil(total / perPage));
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, paymentFilter, currentPage]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const refresh = async () => {
    await loadOrders();
    if (selectedOrder) {
      setSelectedOrder(await ordersService.getOrderById(selectedOrder.id));
    }
  };

  const handleApprove = async (order: Order) => {
    if (!window.confirm(`Approve order ${order.order_number}? This confirms the order and marks it for processing.`)) {
      return;
    }
    try {
      setIsUpdating(true);
      await ordersService.updateOrderStatus(order.id, 'confirmed');
      toast.success(`Order ${order.order_number} approved`);
      await refresh();
    } catch (error: any) {
      console.error('Error approving order:', error);
      toast.error(error.message || 'Failed to approve order');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async (order: Order) => {
    if (!window.confirm(`Cancel order ${order.order_number}? This cannot be undone.`)) {
      return;
    }
    try {
      setIsUpdating(true);
      await ordersService.cancelOrder(order.id);
      toast.success(`Order ${order.order_number} cancelled`);
      await refresh();
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      toast.error(error.message || 'Failed to cancel order');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusUpdate = async (order: Order, status: string) => {
    try {
      setIsUpdating(true);
      await ordersService.updateOrderStatus(order.id, status);
      toast.success(`Order ${order.order_number} marked as ${status}`);
      await refresh();
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error(error.message || 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerifyPayment = async (order: Order) => {
    if (!window.confirm(`Confirm payment for order ${order.order_number}? The customer will be notified by email.`)) {
      return;
    }
    try {
      setIsUpdating(true);
      await ordersService.updatePaymentStatus(order.id, 'paid', order.order_number, undefined, {
        verifiedBy: 'admin',
      });
      toast.success(`Payment for ${order.order_number} confirmed`);
      await refresh();
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      toast.error(error.message || 'Failed to verify payment');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejectReceipt = async (order: Order) => {
    const reason = window.prompt(
      `Reason for rejecting the receipt for ${order.order_number} (this is shown to the customer):`
    );
    if (reason === null) return;
    try {
      setIsUpdating(true);
      await ordersService.updatePaymentStatus(order.id, 'failed', undefined, undefined, {
        paymentNote: reason.trim() || 'Receipt could not be verified',
      });
      toast.success(`Receipt for ${order.order_number} rejected`);
      await refresh();
    } catch (error: any) {
      console.error('Error rejecting receipt:', error);
      toast.error(error.message || 'Failed to reject receipt');
    } finally {
      setIsUpdating(false);
    }
  };

  const customerName = (order: Order) => {
    const c = order.customer;
    if (!c) return 'Guest';
    const full = [c.first_name, c.last_name].filter(Boolean).join(' ');
    return full || c.email || 'Customer';
  };

  if (isLoading && orders.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold uppercase tracking-wide text-ink">Orders</h1>
          <p className="text-metallic-600 mt-1">Review, approve and fulfil customer orders</p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by order number, customer email or name..."
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-44">
              <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} options={ORDER_STATUS_OPTIONS} />
            </div>
            <div className="w-full sm:w-44">
              <Select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }} options={PAYMENT_STATUS_OPTIONS} />
            </div>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        {orders.length === 0 ? (
          <EmptyState
            title="No orders found"
            description={searchTerm || statusFilter || paymentFilter ? 'Try adjusting your filters' : 'No orders yet — they will appear here once customers place them'}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-metallic-50 border-b border-metallic-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-metallic-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-metallic-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-metallic-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-metallic-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-metallic-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-metallic-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-metallic-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-metallic-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-metallic-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-metallic-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-ink">{order.order_number}</div>
                        {order.payment_reference && (
                          <div className="text-xs text-metallic-500">Ref: {order.payment_reference.slice(0, 16)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-ink">{customerName(order)}</div>
                        {order.customer?.phone && (
                          <div className="text-xs text-metallic-500">{order.customer.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-metallic-600">{formatDate(order.created_at)}</td>
                      <td className="px-6 py-4 text-sm text-metallic-600">
                        {order.items?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-ink">
                        {formatPrice(order.total_amount)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={paymentStatusBadge[order.payment_status] || 'secondary'}>
                          {order.payment_status}
                        </Badge>
                        {order.receipt_path && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-metallic-500" title="Receipt uploaded">
                            <PhotoIcon className="w-3.5 h-3.5" />
                            Receipt
                          </div>
                        )}
                        {order.payment_verified_at && (
                          <div className="mt-1 text-xs text-green-600">Verified {formatDate(order.payment_verified_at)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={orderStatusBadge[order.status] || 'secondary'}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-metallic-600 hover:text-ink hover:bg-metallic-100 rounded-lg transition-colors"
                            title="View details"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleApprove(order)}
                              disabled={isUpdating}
                              leftIcon={<CheckBadgeIcon className="w-4 h-4" />}
                            >
                              Approve
                            </Button>
                          )}
                          {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing') && (
                            <button
                              onClick={() => handleCancel(order)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-metallic-100 rounded-lg transition-colors"
                              title="Cancel order"
                            >
                              <XCircleIcon className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-metallic-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={totalCount}
                  itemsPerPage={perPage}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Order Detail Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Order Details" size="lg">
        {selectedOrder && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-ink">{selectedOrder.order_number}</h3>
                <p className="text-sm text-metallic-500">Placed {formatDate(selectedOrder.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={orderStatusBadge[selectedOrder.status] || 'secondary'}>
                  {selectedOrder.status}
                </Badge>
                <Badge variant={paymentStatusBadge[selectedOrder.payment_status] || 'secondary'}>
                  {selectedOrder.payment_status}
                </Badge>
              </div>
            </div>

            {/* Customer + shipping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-metallic-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-metallic-500 uppercase tracking-wider mb-2">Customer</p>
                <p className="font-medium text-ink">{customerName(selectedOrder)}</p>
                <p className="text-metallic-600">{selectedOrder.customer?.email}</p>
                {selectedOrder.customer?.phone && (
                  <p className="text-metallic-600">{selectedOrder.customer.phone}</p>
                )}
                {selectedOrder.customer_notes && (
                  <p className="text-metallic-600 mt-2 italic">&ldquo;{selectedOrder.customer_notes}&rdquo;</p>
                )}
              </div>
              <div className="bg-metallic-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-metallic-500 uppercase tracking-wider mb-2">Shipping</p>
                <p className="text-stone-800">
                  {selectedOrder.shipping_address_line1}
                  {selectedOrder.shipping_address_line2 ? `, ${selectedOrder.shipping_address_line2}` : ''}
                </p>
                <p className="text-metallic-600">
                  {[selectedOrder.shipping_city, selectedOrder.shipping_state, selectedOrder.shipping_country].filter(Boolean).join(', ')}
                </p>
                {selectedOrder.shipping_phone && (
                  <p className="text-metallic-600">{selectedOrder.shipping_phone}</p>
                )}
                {selectedOrder.tracking_number && (
                  <p className="text-metallic-600 mt-2">Tracking: {selectedOrder.tracking_number}</p>
                )}
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-xs font-semibold text-metallic-500 uppercase tracking-wider mb-2">Items</p>
              <div className="border border-metallic-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-metallic-50 border-b border-metallic-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-metallic-500 uppercase tracking-wider">Item</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-metallic-500 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-metallic-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-metallic-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-metallic-200">
                    {selectedOrder.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-ink">{item.product_name}</div>
                          {item.product_sku && (
                            <div className="text-xs text-metallic-500">SKU: {item.product_sku}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-metallic-600 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-metallic-600 text-right">{formatPrice(item.unit_price)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-ink text-right">{formatPrice(item.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-1.5 text-sm">
                <div className="flex justify-between text-metallic-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-metallic-600">
                  <span>Shipping</span>
                  <span>{formatPrice(selectedOrder.shipping_cost)}</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-metallic-600">
                    <span>Discount</span>
                    <span>-{formatPrice(selectedOrder.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-ink border-t border-metallic-200 pt-2">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Payment / Receipt */}
            <div className="bg-metallic-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-metallic-500 uppercase tracking-wider mb-3">Payment & Receipt</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant={paymentStatusBadge[selectedOrder.payment_status] || 'secondary'}>
                  {selectedOrder.payment_status}
                </Badge>
                <Badge variant="info">
                  {String(selectedOrder.payment_method || '').replace('_', ' ')}
                </Badge>
              </div>
              {selectedOrder.payment_reference && (
                <p className="text-xs text-metallic-600 mb-1">
                  Reference: <span className="font-mono">{selectedOrder.payment_reference}</span>
                </p>
              )}
              {selectedOrder.payment_verified_at && (
                <p className="text-xs text-green-700 mb-1">
                  Verified {formatDate(selectedOrder.payment_verified_at)}
                  {selectedOrder.payment_verified_by ? ` by ${selectedOrder.payment_verified_by}` : ''}
                </p>
              )}
              {selectedOrder.payment_note && (
                <p className="text-xs text-red-600 mb-2">
                  Note: {selectedOrder.payment_note}
                </p>
              )}
              {selectedOrder.receipt_path && (
                <div className="mt-2">
                  <p className="text-xs font-semibold text-metallic-500 uppercase tracking-wider mb-2">Customer Receipt</p>
                  {receiptSignedUrl ? (
                    <a href={receiptSignedUrl} target="_blank" rel="noopener noreferrer" className="block">
                      <img
                        src={receiptSignedUrl}
                        alt={`Receipt for ${selectedOrder.order_number}`}
                        className="w-full max-w-xs max-h-64 object-contain bg-white rounded-lg ring-1 ring-black/5 p-2 cursor-zoom-in"
                      />
                    </a>
                  ) : (
                    <div className="w-full max-w-xs h-40 rounded-lg bg-metallic-100 skeleton" />
                  )}
                  <p className="text-xs text-metallic-500 mt-1">Secure link · expires after 10 minutes</p>
                </div>
              )}
              {selectedOrder.receipt_path && selectedOrder.payment_status !== 'paid' && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button
                    size="sm"
                    onClick={() => handleVerifyPayment(selectedOrder)}
                    disabled={isUpdating}
                    leftIcon={<CheckCircleIcon className="w-4 h-4" />}
                  >
                    Confirm Payment
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleRejectReceipt(selectedOrder)}
                    disabled={isUpdating}
                    leftIcon={<XCircleIcon className="w-4 h-4" />}
                  >
                    Reject Receipt
                  </Button>
                </div>
              )}
            </div>

            {/* Status workflow */}
            <div>
              <p className="text-xs font-semibold text-metallic-500 uppercase tracking-wider mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {selectedOrder.status === 'pending' && (
                  <Button size="sm" onClick={() => handleStatusUpdate(selectedOrder, 'confirmed')} disabled={isUpdating} leftIcon={<CheckBadgeIcon className="w-4 h-4" />}>
                    Approve (Confirm)
                  </Button>
                )}
                {selectedOrder.status === 'confirmed' && (
                  <Button size="sm" onClick={() => handleStatusUpdate(selectedOrder, 'processing')} disabled={isUpdating} leftIcon={<ClockIcon className="w-4 h-4" />}>
                    Start Processing
                  </Button>
                )}
                {selectedOrder.status === 'processing' && (
                  <Button size="sm" onClick={() => handleStatusUpdate(selectedOrder, 'shipped')} disabled={isUpdating} leftIcon={<TruckIcon className="w-4 h-4" />}>
                    Mark Shipped
                  </Button>
                )}
                {selectedOrder.status === 'shipped' && (
                  <Button size="sm" onClick={() => handleStatusUpdate(selectedOrder, 'delivered')} disabled={isUpdating} leftIcon={<CheckCircleIcon className="w-4 h-4" />}>
                    Mark Delivered
                  </Button>
                )}
                {(selectedOrder.status === 'pending' || selectedOrder.status === 'confirmed' || selectedOrder.status === 'processing') && (
                  <Button size="sm" variant="danger" onClick={() => handleCancel(selectedOrder)} disabled={isUpdating} leftIcon={<XCircleIcon className="w-4 h-4" />}>
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdersPage;