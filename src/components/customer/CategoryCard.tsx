import { Link } from 'react-router-dom';
import { getCategoryImage } from './categoryImages';
import type { Category } from '../../types';

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
      className="group relative block card card-hover hover:ring-primary-500/50"
    >
      <div className="relative aspect-[4/3] bg-metallic-50 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
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
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-lg font-bold text-ink tracking-wide uppercase leading-tight group-hover:text-primary-700 transition-colors">
            {category.name}
          </h3>
          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-md">
            {productCount} {productCount === 1 ? 'product' : 'products'}
          </span>
        </div>
      </div>
    </Link>
  );
};