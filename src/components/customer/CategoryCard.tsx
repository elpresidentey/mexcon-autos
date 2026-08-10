import { Link } from 'react-router-dom';
import type { Category } from '../../types';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { getCategoryImage } from './categoryImages';

interface CategoryCardProps {
  category: Category & {
    product_count?: number;
  };
}

export const CategoryCard = ({ category }: CategoryCardProps) => {
  const imageUrl = getCategoryImage(category);
  const productCount = category.product_count || 0;

  return (
    <Link
      to={`/categories/${category.slug}`}
      className="group relative block overflow-hidden rounded-2xl bg-metallic-100 aspect-[5/4] ring-1 ring-black/5 shadow-sm hover:shadow-xl hover:shadow-dark-900/10 hover:ring-2 hover:ring-primary-500/60 transition-all duration-300"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-metallic-200 to-metallic-100">
          <span className="flex items-center justify-center w-16 h-16 rounded-full border-2 border-metallic-300 bg-white/60 font-display text-2xl font-bold text-metallic-500 uppercase">
            {category.name.charAt(0)}
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/35 to-transparent" />

      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold">
        {productCount} {productCount === 1 ? 'product' : 'products'}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-white tracking-wide uppercase leading-tight">
          {category.name}
        </h3>
        <span className="w-9 h-9 flex-shrink-0 rounded-full bg-accent-500 text-black flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shadow-lg shadow-accent-500/30">
          <ArrowRightIcon className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
};