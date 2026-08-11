import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ShoppingBagIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../contexts/CartContext';
import { getCategoryImage } from './categoryImages';
import { getBrandLogo } from './brandLogos';
import type { Product, Brand, Category } from '../../types';

interface ProductCardProps {
  product: Product & {
    brand?: Brand | null;
    category?: Category | null;
  };
}

const formatNaira = (amount: number) => `₦${amount.toLocaleString()}`;

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const primaryImage =
    product.images?.find((img) => img.is_primary)?.url ||
    product.primary_image_url;
  const secondaryImage = product.images?.find((img) => !img.is_primary)?.url;
  const categorySlug = product.category?.slug || 'engine-components';
  const placeholderImage =
    getCategoryImage({ slug: categorySlug, image_url: null }) ||
    '/car-engine.webp';
  const brandLogo = getBrandLogo(product.brand?.slug);
  const [brandLogoFailed, setBrandLogoFailed] = useState(false);
  const effectiveBrandLogo = !brandLogoFailed ? brandLogo : null;
  const effectivePrimary = primaryImage || placeholderImage;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdding) return;
    setIsAdding(true);
    try {
      await addToCart(product);
    } catch (error) {
      console.error('Could not add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group relative block bg-white rounded-2xl overflow-hidden ring-1 ring-black/5 shadow-sm hover:shadow-xl hover:shadow-black/10 hover:ring-2 hover:ring-primary-500/60 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-neutral-50 overflow-hidden">
        <img
          src={effectivePrimary}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          loading={imgFailed ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => {
            if (!imgFailed) setImgFailed(true);
          }}
        />
        {secondaryImage && (
          <img
            src={secondaryImage}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {product.is_featured && (
            <span className="bg-accent-500 text-black text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
              Featured
            </span>
          )}
          {product.oem_number && (
            <span className="bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-1 rounded-md">
              OEM {product.oem_number}
            </span>
          )}
        </div>

        {/* Brand logo */}
        {effectiveBrandLogo && (
          <span className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-white/90 backdrop-blur-sm p-1.5 ring-1 ring-black/5 shadow-sm">
            <img
              src={effectiveBrandLogo}
              alt={product.brand?.name || ''}
              className="w-full h-full object-contain"
              loading="lazy"
              decoding="async"
              onError={() => setBrandLogoFailed(true)}
            />
          </span>
        )}

        {/* Quick add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          aria-label={`Add ${product.name} to cart`}
          title="Add to cart"
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-accent-500 text-black flex items-center justify-center shadow-lg shadow-accent-500/30 opacity-100 md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 hover:bg-accent-400 active:scale-95 disabled:opacity-70"
        >
          {isAdding ? (
            <span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
          ) : (
            <ShoppingBagIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold text-primary-700 uppercase tracking-[0.14em] truncate">
            {product.brand?.name || 'Mexcon Autos'}
          </p>
          {product.part_number && (
            <p className="text-[10px] font-mono text-neutral-400 truncate">
              {product.part_number}
            </p>
          )}
        </div>

        <h3 className="font-display text-base font-bold text-black leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-black text-black">
            {formatNaira(product.price)}
          </span>
          <span className="hidden md:inline-flex items-center text-xs font-semibold text-primary-700 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            Shop now
            <ArrowRightIcon className="w-3.5 h-3.5 ml-1" />
          </span>
        </div>
      </div>
    </Link>
  );
};