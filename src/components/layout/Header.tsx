import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, PhoneIcon, ShoppingBagIcon, UserIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartItemCount } = useCart();
  const { isAuthenticated, userType, user } = useAuth();
  const isCustomer = isAuthenticated && userType === 'customer';

  const navigation = [
    { name: 'Shop', href: '/shop' },
    { name: 'Categories', href: '/categories' },
    { name: 'Brands', href: '/brands' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'FAQs', href: '/faqs' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-metallic-200">
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-[4.25rem]">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-white p-2 rounded-lg shadow-sm border border-metallic-200">
              <img
                src="/Logo 1.png"
                alt="Mexcon Group"
                className="h-12 w-auto transition-transform duration-200 group-hover:scale-[1.03]"
                style={{
                  imageRendering: 'crisp-edges',
                  imageRendering: '-webkit-optimize-contrast',
                }}
              />
            </div>
            <div className="leading-none">
              <span className="font-display text-[1.35rem] font-extrabold tracking-wide text-dark-900 uppercase group-hover:text-primary-700 transition-colors">
                Mexcon Group
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `px-3.5 py-2 text-sm font-medium transition-colors rounded-full ${
                    isActive
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-metallic-600 hover:text-dark-900 hover:bg-metallic-50'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="tel:+2349035777779"
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-metallic-700 hover:text-primary-700 transition-colors"
            >
              <PhoneIcon className="w-4 h-4 text-primary-600" />
              <span>0903 577 7779</span>
            </a>

            {isCustomer ? (
              <Link
                to="/account"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-metallic-700 hover:text-primary-700 transition-colors"
                title="My account"
              >
                <UserIcon className="w-5 h-5 text-primary-600" />
                <span className="max-w-[9rem] truncate">
                  {(user as any)?.first_name || 'My Account'}
                </span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors"
              >
                <UserIcon className="w-5 h-5" />
                <span>Login</span>
              </Link>
            )}

            <Link
              to="/cart"
              className="relative p-2 rounded-full hover:bg-metallic-100 transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingBagIcon className="w-6 h-6 text-dark-900" />
              {cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent-500 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <Link
              to="/quote-request"
              className="hidden sm:inline-flex bg-primary-600 text-white px-4.5 py-2 rounded-full text-sm font-semibold hover:bg-primary-700 shadow-sm transition-colors"
            >
              Get Quote
            </Link>

            <button
              className="lg:hidden p-2 rounded-full hover:bg-metallic-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6 text-dark-900" />
              ) : (
                <Bars3Icon className="w-6 h-6 text-dark-900" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-metallic-200 overflow-hidden"
            >
              <div className="py-3 space-y-0.5">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-3 py-2.5 text-metallic-700 hover:bg-metallic-50 hover:text-dark-900 rounded-lg font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <a
                  href="tel:+2349035777779"
                  className="flex items-center gap-2 px-3 py-2.5 text-primary-700 hover:bg-primary-50 rounded-lg font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <PhoneIcon className="w-4 h-4" />
                  <span>0903 577 7779</span>
                </a>
                {isCustomer ? (
                  <Link
                    to="/account"
                    className="flex items-center gap-2 px-3 py-2.5 text-primary-700 hover:bg-primary-50 rounded-lg font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>My Account</span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-3 py-2.5 text-primary-700 hover:bg-primary-50 rounded-lg font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Login / Register</span>
                  </Link>
                )}
                <Link
                  to="/quote-request"
                  className="block mx-1 mt-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg font-semibold text-center hover:bg-primary-700 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Quote
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};
