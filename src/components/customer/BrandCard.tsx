import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { Brand } from '../../types';
import { getBrandLogo } from './brandLogos';

interface BrandCardProps {
  brand: Brand & {
    product_count?: number;
  };
  variant?: 'default' | 'compact';
}

export const BrandCard = ({ brand, variant = 'default' }: BrandCardProps) => {
  const [logoFailed, setLogoFailed] = useState(false);
  const logoUrl = !logoFailed && (brand.logo_url || getBrandLogo(brand.slug));

  if (variant === 'compact') {
    return (
      <Link
        to={`/brands/${brand.slug}`}
        className="group flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl ring-1 ring-black/5 shadow-sm hover:shadow-lg hover:shadow-black/8 hover:ring-primary-500/50 hover:-translate-y-1 transition-all duration-300"
        title={brand.name}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={brand.name}
            className="max-h-10 max-w-full object-contain opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
            loading="lazy"
            decoding="async"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <span className="font-display text-lg font-bold text-neutral-700 group-hover:text-primary-700 tracking-wide uppercase text-center leading-tight">
            {brand.name}
          </span>
        )}
        {logoUrl && (
          <span className="text-xs font-medium text-neutral-500 group-hover:text-primary-700 text-center leading-tight">
            {brand.name}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      to={`/brands/${brand.slug}`}
      className="group block bg-white rounded-2xl ring-1 ring-black/5 shadow-sm hover:shadow-lg hover:shadow-black/8 hover:ring-primary-500/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      <div className="relative aspect-[4/3] bg-neutral-50 flex items-center justify-center p-6 border-b border-neutral-100/70">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={brand.name}
            className="max-w-full max-h-full object-contain opacity-90 transition-transform duration-300 group-hover:scale-[1.04]"
            loading="lazy"
            decoding="async"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <span className="font-display text-2xl font-bold text-neutral-700 group-hover:text-primary-700 tracking-wide uppercase text-center leading-tight">
            {brand.name}
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-lg font-bold text-black tracking-wide uppercase group-hover:text-primary-700 transition-colors">
            {brand.name}
          </h3>
          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-md">
            {brand.product_count || 0}
          </span>
        </div>

        {brand.country && (
          <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider mt-2">
            {brand.country}
          </p>
        )}

        {brand.description && (
          <p className="text-sm text-neutral-600 line-clamp-2 mt-2">
            {brand.description}
          </p>
        )}
      </div>
    </Link>
  );
};