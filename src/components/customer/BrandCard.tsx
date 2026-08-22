import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import type { Brand } from '../../types';
import { sbImg } from '../../services/supabase';
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
  const displayLogo = logoUrl ? sbImg(logoUrl, 160) || logoUrl : null;
  const count = brand.product_count || 0;

  if (variant === 'compact') {
    return (
      <Link
        to={`/brands/${brand.slug}`}
        className="group card card-hover flex flex-col items-center justify-center gap-2.5 px-3 py-5 min-h-[7.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        title={brand.name}
      >
        {logoUrl ? (
          <img
            src={displayLogo || logoUrl}
            alt=""
            aria-hidden="true"
            className="h-10 max-w-[4.5rem] object-contain opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
            loading="lazy"
            decoding="async"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <span className="font-display text-lg font-bold text-metallic-700 group-hover:text-primary-700 tracking-wide uppercase text-center leading-tight">
            {brand.name}
          </span>
        )}
                {logoUrl && (
          <span className="text-[11px] font-semibold text-metallic-500 group-hover:text-primary-700 text-center leading-tight tracking-wide uppercase">
            {brand.name}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      to={`/brands/${brand.slug}`}
      className="group flex flex-col card card-hover overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] bg-metallic-50 flex items-center justify-center p-8 border-b border-metallic-100">
        {logoUrl ? (
          <img
            src={displayLogo || logoUrl}
            alt={brand.name}
            className="max-w-[70%] max-h-[70%] object-contain opacity-90 transition-transform duration-300 group-hover:scale-[1.06]"
            loading="lazy"
            decoding="async"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <span className="font-display text-2xl font-bold text-metallic-700 group-hover:text-primary-700 tracking-wide uppercase text-center leading-tight">
            {brand.name}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold text-ink tracking-wide uppercase group-hover:text-primary-700 transition-colors">
              {brand.name}
            </h3>
            {brand.country && (
              <p className="text-[11px] font-semibold text-metallic-400 uppercase tracking-[0.14em] mt-1">
                {brand.country}
              </p>
            )}
          </div>
          <span className="shrink-0 text-[11px] font-semibold text-primary-700 bg-primary-50 px-2 py-1 rounded-md">
            {count} {count === 1 ? 'part' : 'parts'}
          </span>
        </div>

        {brand.description && (
          <p className="text-sm text-metallic-600 line-clamp-2 mt-2.5">
            {brand.description}
          </p>
        )}

        <span className="mt-auto pt-4 inline-flex items-center text-xs font-semibold text-primary-700 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          Shop brand
          <ArrowRightIcon className="w-3.5 h-3.5 ml-1" />
        </span>
      </div>
    </Link>
  );
};
