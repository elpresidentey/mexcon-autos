import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { CartProvider } from './contexts/CartContext';
import { Layout, AdminLayout } from './components/layout';
import { ProtectedRoute, LoadingSpinner } from './components/common';
import { HomePage } from './pages/customer/HomePage';

const ShopPage = lazy(() => import('./pages/customer/ShopPage').then((m) => ({ default: m.ShopPage })));
const CustomerCategoriesPage = lazy(() => import('./pages/customer/CategoriesPage').then((m) => ({ default: m.CategoriesPage })));
const CustomerBrandsPage = lazy(() => import('./pages/customer/BrandsPage').then((m) => ({ default: m.BrandsPage })));
const CategoryProductsPage = lazy(() => import('./pages/customer/CategoryProductsPage').then((m) => ({ default: m.CategoryProductsPage })));
const BrandProductsPage = lazy(() => import('./pages/customer/BrandProductsPage').then((m) => ({ default: m.BrandProductsPage })));
const ProductDetailPage = lazy(() => import('./pages/customer/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const QuoteRequestPage = lazy(() => import('./pages/customer/QuoteRequestPage').then((m) => ({ default: m.QuoteRequestPage })));
const AboutUsPage = lazy(() => import('./pages/customer/AboutUsPage').then((m) => ({ default: m.AboutUsPage })));
const ContactPage = lazy(() => import('./pages/customer/ContactPage').then((m) => ({ default: m.ContactPage })));
const PrivacyPolicyPage = lazy(() => import('./pages/customer/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })));
const TermsPage = lazy(() => import('./pages/customer/TermsPage').then((m) => ({ default: m.TermsPage })));
const PaymentMethodsPage = lazy(() => import('./pages/customer/PaymentMethodsPage').then((m) => ({ default: m.PaymentMethodsPage })));
const GuaranteesPage = lazy(() => import('./pages/customer/GuaranteesPage').then((m) => ({ default: m.GuaranteesPage })));
const FAQsPage = lazy(() => import('./pages/customer/FAQsPage').then((m) => ({ default: m.FAQsPage })));
const MaintenanceTipsPage = lazy(() => import('./pages/customer/MaintenanceTipsPage').then((m) => ({ default: m.MaintenanceTipsPage })));
const CartPage = lazy(() => import('./pages/customer/CartPage').then((m) => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./pages/customer/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const OrderTrackingPage = lazy(() => import('./pages/customer/OrderTrackingPage').then((m) => ({ default: m.OrderTrackingPage })));
const CustomerLoginPage = lazy(() => import('./pages/customer/LoginPage').then((m) => ({ default: m.LoginPage })));
const CustomerRegisterPage = lazy(() => import('./pages/customer/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const AccountPage = lazy(() => import('./pages/customer/AccountPage').then((m) => ({ default: m.AccountPage })));
const UIComponentsDemo = lazy(() => import('./pages/demo/UIComponentsDemo').then((m) => ({ default: m.UIComponentsDemo })));
const LoginPage = lazy(() => import('./pages/admin/LoginPage').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ProductsListPage = lazy(() => import('./pages/admin/ProductsListPage').then((m) => ({ default: m.ProductsListPage })));
const ProductFormPage = lazy(() => import('./pages/admin/ProductFormPage').then((m) => ({ default: m.ProductFormPage })));
const AdminCategoriesPage = lazy(() => import('./pages/admin/CategoriesPage').then((m) => ({ default: m.CategoriesPage })));
const AdminBrandsPage = lazy(() => import('./pages/admin/BrandsPage').then((m) => ({ default: m.BrandsPage })));
const EnquiriesListPage = lazy(() => import('./pages/admin/EnquiriesListPage').then((m) => ({ default: m.EnquiriesListPage })));
const EnquiryDetailPage = lazy(() => import('./pages/admin/EnquiryDetailPage').then((m) => ({ default: m.EnquiryDetailPage })));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const ProfilePage = lazy(() => import('./pages/admin/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const MediaLibraryPage = lazy(() => import('./pages/admin/MediaLibraryPage').then((m) => ({ default: m.MediaLibraryPage })));
const OrdersPage = lazy(() => import('./pages/admin/OrdersPage').then((m) => ({ default: m.OrdersPage })));

function PageFallback() {
  return (
    <div className="flex items-center justify-center py-32">
      <LoadingSpinner />
    </div>
  );
}

/** Scroll to top on every route change (browsers otherwise keep the
 *  previous page's scroll offset, making new pages appear to open
 *  mid-way / at the bottom). */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Customer Routes */}
                <Route path="/" element={<Layout><HomePage /></Layout>} />
                <Route path="shop" element={<Layout><ShopPage /></Layout>} />
                <Route path="categories" element={<Layout><CustomerCategoriesPage /></Layout>} />
                <Route path="categories/:slug" element={<Layout><CategoryProductsPage /></Layout>} />
                <Route path="brands" element={<Layout><CustomerBrandsPage /></Layout>} />
                <Route path="brands/:slug" element={<Layout><BrandProductsPage /></Layout>} />
                <Route path="products/:id" element={<Layout><ProductDetailPage /></Layout>} />
                <Route path="quote-request" element={<Layout><QuoteRequestPage /></Layout>} />
                <Route path="about" element={<Layout><AboutUsPage /></Layout>} />
                <Route path="contact" element={<Layout><ContactPage /></Layout>} />
                <Route path="privacy-policy" element={<Layout><PrivacyPolicyPage /></Layout>} />
                <Route path="terms" element={<Layout><TermsPage /></Layout>} />
                <Route path="payment-methods" element={<Layout><PaymentMethodsPage /></Layout>} />
                <Route path="guarantees" element={<Layout><GuaranteesPage /></Layout>} />
                <Route path="faqs" element={<Layout><FAQsPage /></Layout>} />
                <Route path="maintenance-tips" element={<Layout><MaintenanceTipsPage /></Layout>} />
                <Route path="cart" element={<Layout><CartPage /></Layout>} />
                <Route path="checkout" element={<Layout><CheckoutPage /></Layout>} />
                <Route path="track-order" element={<Layout><OrderTrackingPage /></Layout>} />
                <Route path="login" element={<Layout><CustomerLoginPage /></Layout>} />
                <Route path="register" element={<Layout><CustomerRegisterPage /></Layout>} />
                <Route path="account" element={<Layout><AccountPage /></Layout>} />
                <Route path="demo/ui-components" element={<Layout><UIComponentsDemo /></Layout>} />

                {/* Admin Login */}
                <Route path="/admin/login" element={<LoginPage />} />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="products" element={<ProductsListPage />} />
                  <Route path="products/new" element={<ProductFormPage />} />
                  <Route path="products/:id/edit" element={<ProductFormPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="brands" element={<AdminBrandsPage />} />
                  <Route path="enquiries" element={<EnquiriesListPage />} />
                  <Route path="enquiries/:id" element={<EnquiryDetailPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="media" element={<MediaLibraryPage />} />
                </Route>

                {/* 404 Not Found */}
                <Route path="*" element={
                  <Layout>
                    <div className="container-custom py-20 text-center">
                      <h1 className="text-4xl font-bold text-secondary-900 mb-4">
                        Page Not Found
                      </h1>
                      <p className="text-secondary-600 mb-8">
                        The page you're looking for doesn't exist.
                      </p>
                      <a href="/" className="btn btn-primary">
                        Go Home
                      </a>
                    </div>
                  </Layout>
                } />
              </Routes>
            </Suspense>
          </Router>
        </CartProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;