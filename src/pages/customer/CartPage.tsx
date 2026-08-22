import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { sbImg } from '../../services/supabase';
import { LoadingSpinner, EmptyState } from '../../components/common';
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

export const CartPage = () => {
  const { cart, cartTotal, cartItemCount, removeFromCart, updateQuantity, isLoading } = useCart();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-custom py-20">
          <div className="flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-custom py-20">
          <div className="max-w-2xl mx-auto">
            <h1 className="font-display text-4xl font-extrabold text-ink uppercase tracking-wide mb-8">Shopping Cart</h1>
            <div className="card p-12">
              <EmptyState
                title="Your cart is empty"
                description="Add some products to get started"
              />
              <Link
                to="/shop"
                className="btn btn-primary mt-6"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-4xl font-extrabold text-ink uppercase tracking-wide mb-8">Shopping Cart</h1>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="card card-hover p-6"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    {item.product?.primary_image_url && (
                      <img
                        src={sbImg(item.product.primary_image_url, 240) || item.product.primary_image_url}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-xl"
                      />
                    )}

                    {/* Product Details */}
                    <div className="flex-1">
                      <Link
                        to={`/products/${item.product_id}`}
                        className="text-lg font-bold text-dark-900 hover:text-primary-600 transition-colors"
                      >
                        {item.product?.name || 'Product'}
                      </Link>
                      <p className="text-sm text-metallic-600 mt-1">
                        {item.product?.category?.name || ''}
                      </p>
                      <p className="text-lg font-black text-primary-600 mt-2">
                        ₦{(item.product?.price || 0).toLocaleString()}
                      </p>
                    </div>

                    {/* Quantity & Remove */}
                    <div className="flex flex-col items-end gap-3">
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="p-2 text-metallic-500 hover:text-red-600 transition-colors"
                        aria-label="Remove item"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>

                      <div className="flex items-center gap-2 bg-white rounded-lg border border-metallic-200">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="p-2 hover:bg-metallic-100 transition-colors rounded-l-lg"
                          aria-label="Decrease quantity"
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold text-dark-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="p-2 hover:bg-metallic-100 transition-colors rounded-r-lg"
                          aria-label="Increase quantity"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-metallic-700">
                    <span>Subtotal ({cartItemCount} items)</span>
                    <span className="font-semibold">₦{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-metallic-700">
                    <span>Shipping</span>
                    <span className="font-semibold">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-metallic-300 pt-3 flex justify-between text-ink font-black text-lg">
                    <span>Total</span>
                    <span>₦{cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="btn btn-primary btn-lg w-full"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  to="/shop"
                  className="block w-full mt-3 text-center text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
