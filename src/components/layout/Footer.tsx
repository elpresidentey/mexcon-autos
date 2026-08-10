import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Categories', href: '/categories' },
    { name: 'Brands', href: '/brands' },
  ];

  const company = [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Payment Methods', href: '/payment-methods' },
    { name: 'Our Guarantees', href: '/guarantees' },
    { name: 'FAQs', href: '/faqs' },
    { name: 'Maintenance Tips', href: '/maintenance-tips' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms & Conditions', href: '/terms' },
  ];

  const manufacturers = [
    'Toyota', 'Honda', 'Nissan', 'Mazda',
    'Hyundai', 'Kia', 'Lexus', 'Genesis',
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <footer className="bg-primary-950 text-primary-100">
      <div className="h-1 bg-accent-500" />

      <div className="border-b border-primary-900/80 bg-primary-900/40">
        <div className="container-custom py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row lg:items-end gap-5 lg:gap-10 max-w-3xl lg:max-w-none">
            <div className="lg:flex-1">
              <h3 className="font-display text-2xl font-bold text-white tracking-wide uppercase">
                Stay updated
              </h3>
              <p className="text-sm text-primary-200/90 mt-1">
                New stock alerts and seasonal deals — no spam.
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto lg:min-w-[28rem]">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 rounded-xl bg-white text-dark-900 text-sm placeholder:text-metallic-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                required
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-accent-500 text-black text-sm font-semibold rounded-xl hover:bg-accent-400 shadow-md shadow-black/20 hover:-translate-y-0.5 transition-all duration-200"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="container-custom py-12 lg:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="bg-white/10 backdrop-blur-sm p-1.5 rounded-lg border border-white/20">
                <img
                  src="/Logo 2.png"
                  alt="Mexcon Autos"
                  className="h-10 w-auto"
                />
              </div>
              <span className="font-display text-xl font-bold text-white tracking-wide uppercase">
                Mexcon Group
              </span>
            </Link>
            <p className="text-sm text-primary-200/85 leading-relaxed mb-5 max-w-xs">
              Genuine Japanese and Korean auto spare parts, sourced for Nigeria.
            </p>
            <div className="space-y-2.5 text-sm text-primary-100/90">
              <div className="flex items-start gap-2.5">
                <MapPinIcon className="w-4 h-4 text-accent-400 flex-shrink-0 mt-0.5" />
                <span>Lagos, Nigeria</span>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneIcon className="w-4 h-4 text-accent-400 flex-shrink-0" />
                <a href="tel:+2349035777779" className="hover:text-accent-400 transition-colors">
                  0903 577 7779
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <EnvelopeIcon className="w-4 h-4 text-accent-400 flex-shrink-0" />
                <a href="mailto:info@mexconautos.com" className="hover:text-accent-400 transition-colors">
                  info@mexconautos.com
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold text-white tracking-wide uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-200 hover:text-accent-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold text-white tracking-wide uppercase mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              {company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-200 hover:text-accent-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold text-white tracking-wide uppercase mb-4">
              Popular Brands
            </h3>
            <div className="flex flex-wrap gap-x-3 gap-y-2">
              {manufacturers.map((brand) => (
                <Link
                  key={brand}
                  to={`/brands/${brand.toLowerCase()}`}
                  className="text-sm text-primary-200 hover:text-accent-400 transition-colors"
                >
                  {brand}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-900 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-300">
            © {currentYear} Mexcon Autos. All rights reserved.
          </p>
          <p className="text-sm text-primary-500">
            Designed and built by <a href="https://iel-portfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-accent-400 transition-colors underline">IEL Web Services</a>
          </p>
          <div className="flex items-center gap-5">
            <a
              href="https://www.instagram.com/mexcon_autos/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-300 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" aria-hidden="true">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://facebook.com/mexconautos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-300 hover:text-accent-400 transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
