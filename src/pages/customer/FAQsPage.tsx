import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

export const FAQsPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Are your auto parts genuine?',
      answer: 'Yes, all our auto parts are 100% genuine. We source directly from manufacturers and authorized distributors in Japan and Korea. Every part comes with a quality guarantee.'
    },
    {
      question: 'How long does delivery take?',
      answer: 'We deliver nationwide within 24-48 hours. Lagos orders typically arrive within 24 hours, while other states may take up to 48 hours depending on location.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept bank transfers, card payments (Visa, Mastercard, Verve), and pay-on-delivery in select locations including Lagos, Abuja, Port Harcourt, and Ibadan.'
    },
    {
      question: 'Can I return a part if it doesn\'t fit?',
      answer: 'Yes, we offer a 30-day return policy. If a part doesn\'t fit or is defective, you can return it for a full refund or exchange, provided it\'s unused and in original packaging.'
    },
    {
      question: 'Do you offer installation services?',
      answer: 'While we don\'t directly offer installation, we can recommend trusted mechanics and workshops in your area. Contact us for recommendations.'
    },
    {
      question: 'How do I know which part fits my vehicle?',
      answer: 'Use our vehicle search tool to find parts by manufacturer, model, year, and engine type. You can also contact our technical team for free assistance in finding the right part.'
    },
    {
      question: 'Do you ship outside Nigeria?',
      answer: 'Currently, we only ship within Nigeria. However, we can assist international customers with special orders. Contact us for more information.'
    },
    {
      question: 'What if the part I need is not listed?',
      answer: 'We have access to millions of parts. If you don\'t see what you need, submit a quote request and we\'ll source it for you within 24 hours.'
    },
    {
      question: 'Do you offer warranty on parts?',
      answer: 'Yes, most parts come with manufacturer warranty ranging from 3-12 months. Specific warranty information is listed on each product page.'
    },
    {
      question: 'Can I track my order?',
      answer: 'Yes, once your order is shipped, you\'ll receive a tracking number via SMS and email. You can track your order in real-time until delivery.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-dark-900 text-white py-12 lg:py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-base text-metallic-200 max-w-xl mx-auto">
            Find answers to common questions about our products and services
          </p>
        </div>
      </section>

      {/* FAQs */}
      <div className="container-custom py-16">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-metallic-50 rounded-2xl border border-metallic-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-metallic-100 transition-colors"
                >
                  <span className="text-lg font-bold text-dark-900 pr-4">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUpIcon className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-5 pt-0">
                    <p className="text-metallic-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Still Have Questions */}
      <div className="bg-primary-900 text-white py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xl lg:text-2xl font-bold mb-3">Still Have Questions?</h2>
            <p className="text-xl text-white mb-8 leading-relaxed">
              Can't find the answer you're looking for? Our team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contact"
                className="inline-flex bg-accent-500 text-black px-8 py-4 rounded-xl font-bold hover:bg-accent-400 transition-colors"
              >
                Contact Us
              </Link>
              <Link
                to="/quote-request"
                className="inline-flex border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-dark-900 transition-colors"
              >
                Request a Quote
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQsPage;
