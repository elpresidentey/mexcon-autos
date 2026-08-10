import { Seo } from '../../components/Seo';

export const TermsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="Terms & Conditions"
        description="Read the Mexcon Autos terms and conditions covering quote requests, orders, delivery and liability."
        canonicalPath="/terms"
      />

      <section className="relative bg-dark-900 text-white overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-400 via-accent-500 to-primary-400" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="container-custom py-20 lg:py-24 text-center relative z-10">
          <div className="inline-flex items-center justify-center space-x-2 bg-accent-500/20 backdrop-blur-sm border border-accent-500/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold text-accent-400 tracking-wide uppercase">
              The Fine Print
            </span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black leading-[0.95] tracking-tighter mb-4">
            Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-accent-300 to-lime-400">Conditions</span>
          </h1>
          <p className="text-metallic-300 text-lg">Last updated: August 2026</p>
        </div>
      </section>

      <div className="container-custom py-14 lg:py-20 max-w-3xl">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-metallic-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 space-y-10">
          <section>
            <h2 className="text-2xl font-black text-dark-900 mb-3 tracking-tight">1. Acceptance of Terms</h2>
            <p className="text-metallic-600 leading-relaxed">
              By accessing and using the Mexcon Autos website and services, you agree to be
              bound by these Terms & Conditions. If you do not agree with any part of these
              terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-dark-900 mb-3 tracking-tight">2. Our Services</h2>
            <p className="text-metallic-600 leading-relaxed">
              Mexcon Autos provides an online platform for sourcing and requesting price
              quotes for auto spare parts for Japanese and Korean vehicles. We facilitate
              quote requests, source parts from suppliers and arrange delivery.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-dark-900 mb-3 tracking-tight">3. Quote Requests</h2>
            <div className="space-y-3 text-metallic-600 leading-relaxed">
              <ul className="list-disc pl-6 space-y-2">
                <li>Quote requests are not orders. A quote confirms price and availability; it does not reserve stock.</li>
                <li>We aim to respond to all quote requests within 24 hours.</li>
                <li>Quotes are valid for 7 days from the date of issue unless otherwise stated.</li>
                <li>Prices are subject to availability and may change based on supplier costs.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-dark-900 mb-3 tracking-tight">4. Product Information</h2>
            <p className="text-metallic-600 leading-relaxed">
              We make every effort to display accurate product information, including OEM
              numbers and compatibility data. However, we cannot guarantee that all
              information is error-free. Vehicle compatibility information is provided as a
              guide - always confirm fitment with our team before purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-dark-900 mb-3 tracking-tight">5. Ordering & Payment</h2>
            <div className="space-y-3 text-metallic-600 leading-relaxed">
              <ul className="list-disc pl-6 space-y-2">
                <li>Orders are confirmed only after payment is received in full.</li>
                <li>Payment methods will be communicated at the time of order confirmation.</li>
                <li>We reserve the right to cancel orders if a part is no longer available, with a full refund.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-dark-900 mb-3 tracking-tight">6. Delivery</h2>
            <div className="space-y-3 text-metallic-600 leading-relaxed">
              <ul className="list-disc pl-6 space-y-2">
                <li>Delivery times are estimates and may vary due to location, logistics or supplier delays.</li>
                <li>Delivery costs are quoted separately and confirmed before dispatch.</li>
                <li>Risk passes to the customer upon successful delivery.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-dark-900 mb-3 tracking-tight">7. Returns & Refunds</h2>
            <div className="space-y-3 text-metallic-600 leading-relaxed">
              <ul className="list-disc pl-6 space-y-2">
                <li>Wrong parts delivered by our error may be returned within 7 days of receipt.</li>
                <li>Parts must be unused, in original packaging and include all accessories.</li>
                <li>Parts ordered to specific vehicle requirements or special orders are non-refundable unless defective.</li>
                <li>Refunds are processed within 5-10 business days after inspection.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-dark-900 mb-3 tracking-tight">8. Limitation of Liability</h2>
            <p className="text-metallic-600 leading-relaxed">
              To the maximum extent permitted by law, Mexcon Autos shall not be liable for
              any indirect, incidental or consequential damages arising from the use of our
              services or products. Our total liability shall not exceed the amount paid for
              the specific product or service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-dark-900 mb-3 tracking-tight">9. Intellectual Property</h2>
            <p className="text-metallic-600 leading-relaxed">
              All content on this website, including text, graphics, logos and software, is
              the property of Mexcon Autos and protected by applicable intellectual property
              laws. You may not reproduce or use this content without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-dark-900 mb-3 tracking-tight">10. Governing Law</h2>
            <p className="text-metallic-600 leading-relaxed">
              These terms are governed by the laws of the Federal Republic of Nigeria. Any
              disputes shall be subject to the exclusive jurisdiction of the courts of Lagos, Nigeria.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-dark-900 mb-3 tracking-tight">11. Contact</h2>
            <p className="text-metallic-600 leading-relaxed">
              For questions about these terms, contact us at{' '}
              <a href="mailto:info@mexconautos.com" className="text-primary-600 hover:text-primary-700 font-medium">
                info@mexconautos.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
