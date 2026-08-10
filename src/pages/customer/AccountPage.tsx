import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ordersService } from '../../services/orders.service';
import { Seo } from '../../components/Seo';
import { LoadingSpinner } from '../../components/common';
import type { Order } from '../../types';

const orderStatusStyle: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'badge badge-warning' },
  confirmed: { label: 'Confirmed', className: 'badge badge-primary' },
  processing: { label: 'Processing', className: 'badge badge-primary' },
  shipped: { label: 'Shipped', className: 'badge badge-accent' },
  delivered: { label: 'Delivered', className: 'badge badge-success' },
  cancelled: { label: 'Cancelled', className: 'badge badge-danger' },
  refunded: { label: 'Refunded', className: 'badge badge-primary' },
};

export const AccountPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      ordersService
        .getCustomerOrders(user.id)
        .then(setOrders)
        .catch(() => setOrders([]))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white">
      <Seo title="My Account" description="Manage your Mexcon Autos account and track your orders." canonicalPath="/account" />
      <div className="container-custom py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="font-display text-4xl font-extrabold text-dark-900 uppercase tracking-wide">My Account</h1>
              <p className="text-metallic-600 mt-1">
                {(user as any)?.first_name ? `${(user as any).first_name} ${(user as any).last_name || ''}` : user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-danger-outline self-start sm:self-auto"
            >
              Log Out
            </button>
          </div>

          <div className="grid md:grid-cols-[1fr_2fr] gap-6">
            {/* Profile card */}
            <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-6 h-fit">
              <h2 className="font-bold text-dark-900 mb-4">Profile</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-metallic-500 font-medium">Email</dt>
                  <dd className="text-dark-900 font-semibold break-all">{user?.email}</dd>
                </div>
                {(user as any).phone && (
                  <div>
                    <dt className="text-metallic-500 font-medium">Phone</dt>
                    <dd className="text-dark-900 font-semibold">{(user as any).phone}</dd>
                  </div>
                )}
                <div className="pt-3">
                  <Link to="/track-order" className="inline-block text-primary-600 hover:text-primary-700 font-semibold">
                    Track an order →
                  </Link>
                </div>
              </dl>
            </div>

            {/* Orders */}
            <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-6">
              <h2 className="font-bold text-dark-900 mb-4">Order History</h2>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : orders.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-metallic-600 mb-4">You haven&apos;t placed any orders yet.</p>
                  <Link
                    to="/shop"
                    className="btn btn-primary"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => {
                    const style = orderStatusStyle[order.status] || orderStatusStyle.pending;
                    return (
                      <div
                        key={order.id}
                        className="bg-metallic-50 rounded-xl ring-1 ring-black/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md transition-shadow"
                      >
                        <div>
                          <div className="font-bold text-dark-900">{order.order_number}</div>
                          <div className="text-sm text-metallic-600 mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                            {' · '}
                            {order.items?.length || 0} item{(order.items?.length || 0) === 1 ? '' : 's'}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-dark-900">₦{order.total_amount.toLocaleString()}</span>
                          <span className={style.className}>
                            {style.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;