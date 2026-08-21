import { Seo } from '../../components/Seo';

export const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="Privacy Policy"
        description="Read the Mexcon Autos privacy policy to understand how we collect, use and protect your personal information."
        canonicalPath="/privacy-policy"
      />

      <section className="relative bg-dark-900 text-white overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-400 via-accent-500 to-primary-400" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="container-custom py-20 lg:py-24 text-center relative z-10">
          <div className="inline-flex items-center justify-center space-x-2 bg-accent-500/20 backdrop-blur-sm border border-accent-500/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold text-accent-400 tracking-wide uppercase">
              Your Privacy Matters
            </span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black leading-[0.95] tracking-tighter mb-4">
            Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-accent-300 to-lime-400">Policy</span>
          </h1>
          <p className="text-metallic-300 text-lg">Last updated: August 2026</p>
        </div>
      </section>

      <div className="container-custom py-14 lg:py-20 max-w-3xl">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-metallic-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 space-y-10">
          <section>
            <h2 className="text-2xl font-black text-dark-900 mb-3 tracking-tight">1. Introduction</h2>
            <p className="text-metallic-600 leading-relaxed">
              Mexcon Autos ("we", "our", "us") respects your privacy and is committed to
              protecting your personal data. This privacy policy explains how we collect,
              use and safeguard your information when you use our website or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-dark-900 mb-3 tracking-tight">2. Information We Collect</h2>
            <div className="space-y-3 text-metallic-600 leading-relaxed">
              <p>We may collect the following types of information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Contact details:</strong> name, email address, phone number</li>
                <li><strong>Enquiry details:</strong> vehicle information, part details, messages and photos you submit</li>
                <li><strong>Technical data:</strong> IP address, browser type, pages visited (for analytics and security)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-dark-900 mb-3 tracking-tight">3. How We Use Your Information</h2>
            <div className="space-y-3 text-metallic-600 leading-relaxed">
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Respond to your quote requests and enquiries</li>
                <li>Provide pricing, availability and delivery information</li>
                <li>Improve our website, products and services</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-dark-900 mb-3 tracking-tight">4. Data Sharing</h2>
            <p className="text-metallic-600 leading-relaxed">
              We do not sell your personal data. We only share information with trusted
              service providers who help us operate our business (such as hosting and
              analytics providers) and only where required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-dark-900 mb-3 tracking-tight">5. Data Security</h2>
            <p className="text-metallic-600 leading-relaxed">
              We implement appropriate technical and organisational measures to protect
              your personal data against unauthorised access, alteration or loss. Data is
              transmitted over encrypted connections (HTTPS).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-dark-900 mb-3 tracking-tight">6. Data Retention</h2>
            <p className="text-metallic-600 leading-relaxed">
              We retain enquiry records for as long as needed to provide our services and
              meet our legal obligations. You may request deletion of your data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-dark-900 mb-3 tracking-tight">7. Your Rights</h2>
            <div className="space-y-3 text-metallic-600 leading-relaxed">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to or restrict processing of your data</li>
                <li>Lodge a complaint with the relevant supervisory authority</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-dark-900 mb-3 tracking-tight">8. Cookies</h2>
            <p className="text-metallic-600 leading-relaxed">
              Our website may use cookies and similar technologies to improve functionality
              and analyse usage. You can disable cookies in your browser settings, though
              some features may not work correctly without them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-dark-900 mb-3 tracking-tight">9. Contact Us</h2>
            <p className="text-metallic-600 leading-relaxed">
              If you have any questions about this privacy policy or your data, please
              contact us at{' '}
              <a href="mailto:info@mextechautospareparts.com" className="text-primary-600 hover:text-primary-700 font-medium">
                info@mextechautospareparts.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-dark-900 mb-3 tracking-tight">10. Changes to This Policy</h2>
            <p className="text-metallic-600 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of
              significant changes by updating the "Last updated" date at the top of this page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
