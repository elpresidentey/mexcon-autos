import { useState, useEffect, useCallback } from 'react';
import { ordersService } from '../../services/orders.service';
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
          <h1 className="text-3xl font-bold text-stone-900">Orders</h1>
          <p className="text-stone-600 mt-1">Review, approve and fulfil customer orders</p>
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
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-stone-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-stone-900">{order.order_number}</div>
                        {order.payment_reference && (
                          <div className="text-xs text-stone-500">Ref: {order.payment_reference.slice(0, 16)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-stone-900">{customerName(order)}</div>
                        {order.customer?.phone && (
                          <div className="text-xs text-stone-500">{order.customer.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-600">{formatDate(order.created_at)}</td>
                      <td className="px-6 py-4 text-sm text-stone-600">
                        {order.items?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-stone-900">
                        {formatPrice(order.total_amount)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={paymentStatusBadge[order.payment_status] || 'secondary'}>
                          {order.payment_status}
                        </Badge>
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
                            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
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
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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
              <div className="px-6 py-4 border-t border-stone-200">
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
                <h3 className="text-lg font-bold text-stone-900">{selectedOrder.order_number}</h3>
                <p className="text-sm text-stone-500">Placed {formatDate(selectedOrder.created_at)}</p>
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
              <div className="bg-stone-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Customer</p>
                <p className="font-medium text-stone-900">{customerName(selectedOrder)}</p>
                <p className="text-stone-600">{selectedOrder.customer?.email}</p>
                {selectedOrder.customer?.phone && (
                  <p className="text-stone-600">{selectedOrder.customer.phone}</p>
                )}
                {selectedOrder.customer_notes && (
                  <p className="text-stone-600 mt-2 italic">&ldquo;{selectedOrder.customer_notes}&rdquo;</p>
                )}
              </div>
              <div className="bg-stone-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Shipping</p>
                <p className="text-stone-800">
                  {selectedOrder.shipping_address_line1}
                  {selectedOrder.shipping_address_line2 ? `, ${selectedOrder.shipping_address_line2}` : ''}
                </p>
                <p className="text-stone-600">
                  {[selectedOrder.shipping_city, selectedOrder.shipping_state, selectedOrder.shipping_country].filter(Boolean).join(', ')}
                </p>
                {selectedOrder.shipping_phone && (
                  <p className="text-stone-600">{selectedOrder.shipping_phone}</p>
                )}
                {selectedOrder.tracking_number && (
                  <p className="text-stone-600 mt-2">Tracking: {selectedOrder.tracking_number}</p>
                )}
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Items</p>
              <div className="border border-stone-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Item</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-stone-200">
                    {selectedOrder.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-stone-900">{item.product_name}</div>
                          {item.product_sku && (
                            <div className="text-xs text-stone-500">SKU: {item.product_sku}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-stone-600 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-stone-600 text-right">{formatPrice(item.unit_price)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-stone-900 text-right">{formatPrice(item.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-1.5 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span>{formatPrice(selectedOrder.shipping_cost)}</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Discount</span>
                    <span>-{formatPrice(selectedOrder.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-stone-900 border-t border-stone-200 pt-2">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Status workflow */}
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Update Status</p>
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