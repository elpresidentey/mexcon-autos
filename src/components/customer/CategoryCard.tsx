import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { sbImg } from '../../services/supabase';
import { getCategoryImage } from './categoryImages';
import type { Category } from '../../types';

interface CategoryCardProps {
  category: Category & {
    product_count?: number;
  };
}

export const CategoryCard = ({ category }: CategoryCardProps) => {
  const rawUrl = getCategoryImage(category);
  const imageUrl = rawUrl ? sbImg(rawUrl, 800) || rawUrl : null;
  const productCount = category.product_count || 0;

  return (
    <Link
      to={`/categories/${category.slug}`}
      className="group relative flex flex-col card card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] bg-metallic-50 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-metallic-100 to-metallic-50"
          style={{ display: imageUrl ? 'none' : 'flex' }}
        >
          <span className="flex items-center justify-center w-16 h-16 rounded-full border-2 border-metallic-300 bg-white/80 font-display text-2xl font-bold text-metallic-500 uppercase">
            {category.name.charAt(0)}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/35 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="flex items-center justify-between gap-3 p-5">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold text-ink tracking-wide uppercase leading-tight group-hover:text-primary-700 transition-colors">
            {category.name}
          </h3>
          <p className="text-[11px] font-semibold text-metallic-400 uppercase tracking-[0.12em] mt-1">
            {productCount} {productCount === 1 ? 'product' : 'products'}
          </p>
        </div>
        <span className="shrink-0 w-9 h-9 rounded-full bg-accent-500 text-black flex items-center justify-center shadow-md shadow-accent-500/20 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <ArrowRightIcon className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
};
