import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

const shopLinks = [
  { name: 'Shop all parts', href: '/shop' },
  { name: 'Categories', href: '/categories' },
  { name: 'Brands', href: '/brands' },
  { name: 'Request a quote', href: '/quote-request' },
];

const companyLinks = [
  { name: 'About us', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Payment methods', href: '/payment-methods' },
  { name: 'Our guarantees', href: '/guarantees' },
  { name: 'FAQs', href: '/faqs' },
  { name: 'Maintenance tips', href: '/maintenance-tips' },
];

const legalLinks = [
  { name: 'Privacy', href: '/privacy-policy' },
  { name: 'Terms', href: '/terms' },
];

const manufacturers = [
  'Lexus',
  'Toyota',
  'Honda',
  'Mitsubishi',
  'Nissan',
  'Acura',
  'Kia',
  'Hyundai',
];

const linkClass =
  'text-sm text-white/55 hover:text-white transition-colors duration-200';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-dark-900 text-white">
      <div className="h-px bg-gradient-to-r from-accent-500 via-accent-400 to-primary-500" />

      <div className="border-b border-white/[0.08]">
        <div className="container-custom py-10 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-16">
            <div className="lg:max-w-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-400 mb-2">
                Newsletter
              </p>
              <h3 className="font-display text-2xl lg:text-3xl font-bold text-white tracking-wide uppercase">
                Stay updated
              </h3>
              <p className="text-sm text-white/50 mt-2 leading-relaxed">
                New stock alerts and seasonal deals — no spam.
              </p>
            </div>

            {subscribed ? (
              <p className="text-sm font-medium text-primary-400 lg:ml-auto">
                You&apos;re on the list. We&apos;ll be in touch.
              </p>
            ) : (
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-3 w-full lg:flex-1 lg:max-w-xl lg:ml-auto"
              >
                <label htmlFor="footer-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="footer-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/[0.06] text-white text-sm placeholder:text-white/35 border border-white/10 focus:outline-none focus:ring-2 focus:ring-accent-500/60 focus:border-accent-500/40"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-accent-500 text-black text-sm font-semibold rounded-xl hover:bg-accent-400 shadow-lg shadow-accent-500/15 hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-3 mb-5 group">
              <div className="bg-white/[0.08] border border-white/10 p-2 rounded-lg">
                <img src="/Logo 2.png" alt="Mexcon Autos" className="h-9 w-auto" />
              </div>
              <span className="font-display text-xl font-bold text-white tracking-wide uppercase group-hover:text-accent-400 transition-colors">
                Mexcon Group
              </span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed mb-6 max-w-xs">
              Genuine Japanese and Korean auto spare parts, sourced for Nigeria.
            </p>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-3">
                <MapPinIcon className="w-4 h-4 text-accent-400 flex-shrink-0 mt-0.5" />
                <span>Lagos, Nigeria</span>
              </li>
              <li className="flex items-center gap-3">
                <PhoneIcon className="w-4 h-4 text-accent-400 flex-shrink-0" />
                <a href="tel:+2349035777779" className="hover:text-white transition-colors">
                  0903 577 7779
                </a>
              </li>
              <li className="flex items-center gap-3">
                <EnvelopeIcon className="w-4 h-4 text-accent-400 flex-shrink-0" />
                <a href="mailto:info@mextechautospareparts.com" className="hover:text-white transition-colors">
                  info@mextechautospareparts.com
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40 mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className={linkClass}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40 mb-4">
              Company
            </h3>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className={linkClass}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40 mb-4">
              Popular brands
            </h3>
            <div className="flex flex-wrap gap-2">
              {manufacturers.map((brand) => (
                <Link
                  key={brand}
                  to={`/brands/${brand.toLowerCase()}`}
                  className="text-xs font-medium text-white/60 hover:text-white hover:border-white/25 border border-white/10 bg-white/[0.05] px-3 py-1.5 rounded-full transition-colors"
                >
                  {brand}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.08]">
        <div className="container-custom py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-center md:text-left">
            <p className="text-xs text-white/35">
              © {currentYear} Mexcon Autos. All rights reserved.
            </p>
            <span className="hidden sm:block w-px h-3 bg-white/15" aria-hidden="true" />
            <p className="text-xs text-white/25">
              Designed and built by{' '}
              <a
                href="https://iel-portfolio.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent-400 transition-colors underline underline-offset-2"
              >
                IEL Web Services
              </a>
            </p>
          </div>

          <div className="flex items-center justify-center gap-5">
            {legalLinks.map((link) => (
              <Link key={link.name} to={link.href} className="text-xs text-white/40 hover:text-white transition-colors">
                {link.name}
              </Link>
            ))}
            <span className="w-px h-3 bg-white/15" aria-hidden="true" />
            <a
              href="https://www.instagram.com/mexcon_autos/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-accent-400 transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" aria-hidden="true">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://facebook.com/mexconautos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-accent-400 transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
