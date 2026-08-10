import { Link } from 'react-router-dom';
import { CheckCircleIcon, TruckIcon, ShieldCheckIcon, ClockIcon, CurrencyDollarIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export const GuaranteesPage = () => {
  const guarantees = [
    {
      icon: CheckCircleIcon,
      title: '100% Genuine Parts',
      description: 'All our auto parts are sourced directly from manufacturers and authorized distributors. We guarantee authenticity and quality.',
      color: 'bg-primary-600'
    },
    {
      icon: TruckIcon,
      title: 'Fast Nationwide Delivery',
      description: 'We deliver to all 36 states in Nigeria within 24-48 hours. Track your order in real-time from dispatch to delivery.',
      color: 'bg-accent-500'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Quality Assurance',
      description: 'Every part undergoes rigorous quality checks before shipping. If a part doesn\'t meet our standards, we don\'t sell it.',
      color: 'bg-primary-600'
    },
    {
      icon: ClockIcon,
      title: '24/7 Customer Support',
      description: 'Our dedicated support team is available round the clock to assist with orders, technical queries, and after-sales service.',
      color: 'bg-accent-500'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Competitive Pricing',
      description: 'We offer the best prices for genuine auto parts in Nigeria. Match any competitor\'s price for the same genuine part.',
      color: 'bg-primary-600'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Expert Technical Advice',
      description: 'Not sure which part you need? Our automotive experts provide free consultation to help you find the right part for your vehicle.',
      color: 'bg-accent-500'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-dark-900 text-white py-12 lg:py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
            Our Guarantees
          </h1>
          <p className="text-base text-metallic-200 max-w-xl mx-auto">
            Shop with confidence. We stand behind every part we sell.
          </p>
        </div>
      </section>

      {/* Guarantees Grid */}
      <div className="container-custom py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guarantees.map((guarantee, index) => (
              <div key={index} className="bg-metallic-50 rounded-2xl p-8 border border-metallic-200 hover:shadow-xl transition-shadow">
                <div className={`w-14 h-14 ${guarantee.color} rounded-xl flex items-center justify-center mb-6 ${guarantee.color === 'bg-accent-500' ? 'text-black' : 'text-white'}`}>
                  <guarantee.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-dark-900 mb-3">{guarantee.title}</h3>
                <p className="text-metallic-700 leading-relaxed">{guarantee.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Return Policy Highlight */}
      <div className="bg-primary-900 text-white py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xl lg:text-2xl font-bold mb-4">30-Day Return Policy</h2>
            <p className="text-xl text-white mb-8 leading-relaxed">
              Not satisfied with your purchase? Return any unused part within 30 days for a full refund or exchange. 
              No questions asked. Your satisfaction is our priority.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/privacy-policy"
                className="inline-flex bg-accent-500 text-black px-8 py-4 rounded-xl font-bold hover:bg-accent-400 transition-colors"
              >
                Read Return Policy
              </Link>
              <Link
                to="/contact"
                className="inline-flex border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-dark-900 transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Price Match Guarantee */}
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-metallic-50 rounded-2xl p-8 border border-metallic-200">
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="w-20 h-20 bg-accent-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <CurrencyDollarIcon className="w-10 h-10 text-black" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-bold text-dark-900 mb-2">Price Match Guarantee</h3>
                <p className="text-metallic-700 leading-relaxed">
                  Found the same genuine part at a lower price elsewhere? We'll match it. Simply provide proof of the lower price 
                  and we'll adjust our price accordingly. This ensures you always get the best deal without compromising on quality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="container-custom pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-metallic-700 mb-6">
            Have questions about our guarantees? Our team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex bg-primary-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-700 transition-colors"
            >
              Contact Us
            </Link>
            <Link
              to="/shop"
              className="inline-flex border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-xl font-bold hover:bg-primary-50 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuaranteesPage;
