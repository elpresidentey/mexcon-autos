import { Link } from 'react-router-dom';
import { CreditCardIcon, BanknotesIcon, TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export const PaymentMethodsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-dark-900 text-white py-12 lg:py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
            Payment Methods
          </h1>
          <p className="text-base text-metallic-200 max-w-xl mx-auto">
            Secure and flexible payment options for your convenience
          </p>
        </div>
      </section>

      {/* Payment Methods */}
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-8">
            {/* Bank Transfer */}
            <div className="bg-metallic-50 rounded-2xl p-8 border border-metallic-200">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BanknotesIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-dark-900 mb-2">Bank Transfer</h3>
                  <p className="text-metallic-700 mb-4">
                    Direct bank transfer to our corporate account. Ideal for large orders and wholesale purchases.
                  </p>
                  <div className="bg-white rounded-xl p-4 border border-metallic-200">
                    <p className="text-sm text-metallic-600 mb-2">Bank Name:</p>
                    <p className="font-bold text-dark-900 mb-3">Access Bank</p>
                    <p className="text-sm text-metallic-600 mb-2">Account Number:</p>
                    <p className="font-bold text-dark-900 mb-3">1234567890</p>
                    <p className="text-sm text-metallic-600 mb-2">Account Name:</p>
                    <p className="font-bold text-dark-900">Mexcon Autos Limited</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Payment */}
            <div className="bg-metallic-50 rounded-2xl p-8 border border-metallic-200">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-accent-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CreditCardIcon className="w-6 h-6 text-black" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-dark-900 mb-2">Card Payment</h3>
                  <p className="text-metallic-700 mb-4">
                    Pay securely with your debit or credit card. We accept Visa, Mastercard, and Verve cards.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-white rounded-lg border border-metallic-200 text-sm font-semibold text-metallic-700">Visa</span>
                    <span className="px-4 py-2 bg-white rounded-lg border border-metallic-200 text-sm font-semibold text-metallic-700">Mastercard</span>
                    <span className="px-4 py-2 bg-white rounded-lg border border-metallic-200 text-sm font-semibold text-metallic-700">Verve</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pay on Delivery */}
            <div className="bg-metallic-50 rounded-2xl p-8 border border-metallic-200">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TruckIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-dark-900 mb-2">Pay on Delivery</h3>
                  <p className="text-metallic-700 mb-4">
                    Pay cash when your order is delivered. Available in Lagos and select locations across Nigeria.
                  </p>
                  <div className="bg-white rounded-xl p-4 border border-metallic-200">
                    <p className="text-sm text-metallic-600 mb-1">Available in:</p>
                    <p className="font-bold text-dark-900">Lagos, Abuja, Port Harcourt, Ibadan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="mt-12 bg-primary-50 rounded-2xl p-8 border border-primary-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-dark-900 mb-2">Secure Transactions</h3>
                <p className="text-metallic-700">
                  All payments are processed through secure payment gateways with industry-standard encryption. 
                  Your financial information is never stored on our servers.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link
              to="/shop"
              className="inline-flex bg-primary-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsPage;
