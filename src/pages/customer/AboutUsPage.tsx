import { Seo, organizationJsonLd } from '../../components/Seo';
import {
  ShieldCheckIcon,
  TruckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

const values = [
  {
    icon: ShieldCheckIcon,
    title: 'Authenticity Guaranteed',
    description: 'Every part we supply is genuine OEM or high-quality equivalent sourced from trusted suppliers.',
  },
  {
    icon: WrenchScrewdriverIcon,
    title: 'Technical Expertise',
    description: 'Our team understands Japanese and Korean vehicles inside out and helps you find the exact part.',
  },
  {
    icon: ClockIcon,
    title: 'Fast Response',
    description: 'Quote requests are answered within 24 hours. No long waits, no guesswork.',
  },
  {
    icon: TruckIcon,
    title: 'Reliable Delivery',
    description: 'Nationwide delivery across Nigeria with careful packaging to protect your parts.',
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Fair Pricing',
    description: 'Competitive market prices with no hidden charges. You know what you pay for.',
  },
  {
    icon: PhoneIcon,
    title: 'Dedicated Support',
    description: 'Reach us by phone, email or WhatsApp - we are always happy to help.',
  },
];

export const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="About Us"
        description="Mexcon Autos supplies genuine Japanese and Korean auto spare parts in Nigeria. Learn about our mission, history and what makes us different."
        canonicalPath="/about"
        jsonLd={[organizationJsonLd()]}
      />

      {/* Hero - Bold */}
      <section className="relative bg-dark-900 text-white overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-400 via-accent-500 to-primary-400" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="container-custom py-12 lg:py-16 text-center relative z-10">
          <div className="inline-flex items-center justify-center space-x-2 bg-accent-500/20 backdrop-blur-sm border border-accent-500/30 rounded-full px-3.5 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 bg-accent-400 rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold text-accent-400 tracking-wide uppercase">
              Our Story
            </span>
          </div>
          <h1 className="font-display text-4xl lg:text-5xl font-extrabold uppercase tracking-wide leading-none mb-3">
            About <span className="text-accent-400">Mexcon Autos</span>
          </h1>
          <p className="text-base text-metallic-300 max-w-xl mx-auto leading-relaxed">
            Your trusted source for genuine Japanese and Korean auto spare parts in Nigeria
          </p>
        </div>
      </section>

      {/* Story */}
      <div className="container-custom py-14 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <h2 className="font-display text-2xl lg:text-3xl font-bold uppercase tracking-wide text-ink mb-4">
              Our <span className="text-primary-600">Story</span>
            </h2>
            <div className="space-y-4 text-metallic-600 leading-relaxed text-base">
              <p>
                Mexcon Autos was founded with a simple mission: to make finding quality spare
                parts for Japanese and Korean vehicles in Nigeria easy, reliable and affordable.
                For years, vehicle owners struggled with counterfeit parts, unreliable suppliers
                and endless searches through scattered markets.
              </p>
              <p>
                We set out to change that. By building direct relationships with trusted
                suppliers and leveraging deep knowledge of Asian vehicle platforms, we source
                genuine OEM and equivalent parts for Lexus, Toyota, Mitsubishi, Nissan, Acura, Kia and
                many more manufacturers.
              </p>
              <p>
                Today, Mexcon Autos serves vehicle owners, mechanics and auto dealers across
                Nigeria, delivering the right part, at the right price, every time.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-metallic-50 rounded-3xl p-8 lg:p-10 border border-metallic-200/50 shadow-card hover:shadow-card-hover transition-all duration-500">
            <h3 className="font-display text-xl font-bold uppercase tracking-wide text-ink mb-6">Our Mission & Vision</h3>
            <div className="space-y-6">
              <div className="pl-5 border-l-4 border-primary-500 hover:border-primary-600 transition-colors">
                <h4 className="font-semibold text-primary-600 mb-1.5 text-base">Our Mission</h4>
                <p className="text-metallic-600 leading-relaxed">
                  To provide genuine, high-quality auto spare parts backed by expert guidance
                  and outstanding customer service, so every customer gets the right part the
                  first time.
                </p>
              </div>
              <div className="pl-5 border-l-4 border-accent-400 hover:border-accent-500 transition-colors">
                <h4 className="font-semibold text-accent-600 mb-1.5 text-base">Our Vision</h4>
                <p className="text-metallic-600 leading-relaxed">
                  To become Nigeria's most trusted name in auto spare parts sourcing, known for
                  authenticity, speed and service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-gradient-to-b from-metallic-50 to-white py-14 lg:py-20 border-y border-metallic-200/50">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl lg:text-3xl font-bold uppercase tracking-wide text-ink mb-2">
              Why Choose <span className="text-accent-500">Us</span>
            </h2>
            <p className="text-sm lg:text-base text-metallic-600 max-w-xl mx-auto">
              Six reasons vehicle owners and mechanics across Nigeria trust Mexcon Autos
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value) => (
              <div key={value.title} className="group p-8 rounded-3xl bg-white border border-metallic-200/50 hover:border-accent-400/50 hover:shadow-2xl hover:shadow-accent-500/10 transition-all duration-500 hover:-translate-y-2">
                <div className="w-14 h-14 bg-gradient-to-br from-accent-400 to-accent-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-accent-500/25 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-7 h-7 text-black" />
                </div>
                <h3 className="font-display text-lg font-bold uppercase tracking-wide text-ink mb-2">{value.title}</h3>
                <p className="text-metallic-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats - Bold */}
      <div className="relative bg-dark-900 text-white py-12 lg:py-16 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl lg:text-3xl font-bold text-accent-400">15+</p>
              <p className="text-metallic-300 mt-1.5 font-medium uppercase tracking-wider text-xs">Vehicle Brands</p>
            </div>
            <div>
              <p className="text-2xl lg:text-3xl font-bold text-accent-400">1000+</p>
              <p className="text-metallic-300 mt-1.5 font-medium uppercase tracking-wider text-xs">Parts Sourced</p>
            </div>
            <div>
              <p className="text-2xl lg:text-3xl font-bold text-accent-400">24hr</p>
              <p className="text-metallic-300 mt-1.5 font-medium uppercase tracking-wider text-xs">Quote Response</p>
            </div>
            <div>
              <p className="text-2xl lg:text-3xl font-bold text-accent-400">100%</p>
              <p className="text-metallic-300 mt-1.5 font-medium uppercase tracking-wider text-xs">Genuine Parts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
