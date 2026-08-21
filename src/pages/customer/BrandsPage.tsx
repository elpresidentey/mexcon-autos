import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { brandsService } from '../../services/brands.service';
import type { Brand } from '../../types';
import { BrandCard } from '../../components/customer/BrandCard';
import { LoadingSpinner, EmptyState, Reveal } from '../../components/common';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';

export const BrandsPage = () => {
  const [brands, setBrands] = useState<(Brand & { product_count?: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setIsLoading(true);
      const data = await brandsService.getBrandsWithProductCounts();
      // Only show active brands and exclude daihatsu and genesis
      const activeBrands = data.filter(b => 
        b.is_active && 
        b.slug !== 'daihatsu' && 
        b.slug !== 'genesis'
      );
      setBrands(activeBrands);
    } catch (error) {
      console.error('Error loading brands:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Group brands by country/region
  const japaneseBrands = brands.filter(b => 
    ['Japan', 'Japanese'].some(keyword => b.country?.includes(keyword))
  );
  const koreanBrands = brands.filter(b => 
    ['Korea', 'Korean', 'South Korea'].some(keyword => b.country?.includes(keyword))
  );
  const otherBrands = brands.filter(b => 
    !japaneseBrands.includes(b) && !koreanBrands.includes(b)
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Bold */}
      <section className="relative bg-dark-900 text-white overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-400 via-accent-500 to-primary-400" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="container-custom relative z-10 py-12 lg:py-16 text-center">
          <div className="inline-flex items-center justify-center space-x-2 bg-accent-500/20 backdrop-blur-sm border border-accent-500/30 rounded-full px-3.5 py-1.5 mb-5">
            <BuildingStorefrontIcon className="w-4 h-4 text-accent-400" />
            <span className="text-xs font-semibold text-accent-400 tracking-wide uppercase">
              Trusted Manufacturers
            </span>
          </div>
          <h1 className="font-display text-4xl lg:text-5xl font-extrabold tracking-wide uppercase mb-3">
            Shop by <span className="text-accent-400">Brand</span>
          </h1>
          <p className="text-base text-metallic-300 max-w-xl mx-auto leading-relaxed">
            Quality auto parts for Japanese and Korean vehicle manufacturers
          </p>
        </div>
      </section>

      {/* Brands Grid */}
      <div className="container-custom py-14 lg:py-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : brands.length === 0 ? (
          <div className="card p-12">
            <EmptyState
              title="No brands available"
              description="Check back soon for new brands"
            />
          </div>
        ) : (
          <>
            <div className="text-center mb-14">
              <p className="text-metallic-600 font-medium">
                Showing <span className="font-black text-ink">{brands.length}</span> brands
              </p>
            </div>

            {/* Japanese Brands */}
            {japaneseBrands.length > 0 && (
              <div className="mb-16">
                <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-dark-900 uppercase tracking-wide mb-6 flex items-center gap-3">
                  <span className="badge badge-primary">JP</span>
                  Japanese <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-lime-500">Brands</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {japaneseBrands.map((brand, index) => (
                    <Reveal key={brand.id} delay={Math.min(index * 0.06, 0.36)}>
                      <BrandCard brand={brand} />
                    </Reveal>
                  ))}
                </div>
              </div>
            )}

            {/* Korean Brands */}
            {koreanBrands.length > 0 && (
              <div className="mb-16">
                <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-dark-900 uppercase tracking-wide mb-6 flex items-center gap-3">
                  <span className="badge badge-accent">KR</span>
                  Korean <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-lime-500">Brands</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {koreanBrands.map((brand, index) => (
                    <Reveal key={brand.id} delay={Math.min(index * 0.06, 0.36)}>
                      <BrandCard brand={brand} />
                    </Reveal>
                  ))}
                </div>
              </div>
            )}

            {/* Other Brands */}
            {otherBrands.length > 0 && (
              <div>
                <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-dark-900 uppercase tracking-wide mb-6">
                  All <span className="text-primary-600">Brands</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {otherBrands.map((brand, index) => (
                    <Reveal key={brand.id} delay={Math.min(index * 0.06, 0.36)}>
                      <BrandCard brand={brand} />
                    </Reveal>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info Section - Bold */}
      <div className="bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white py-14 lg:py-16 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="container-custom relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl lg:text-4xl font-extrabold tracking-wide uppercase mb-3">
              Specializing in <span className="text-accent-400">Japanese & Korean</span> Vehicles
            </h2>
            <p className="text-metallic-300 text-sm lg:text-base leading-relaxed mb-6">
              We stock genuine and OEM-equivalent parts for all major Japanese and Korean manufacturers.
              From Toyota to Hyundai, Mitsubishi to Acura, we have the parts you need to keep your vehicle running smoothly.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/shop"
                className="btn btn-accent btn-lg"
              >
                Browse All Products
              </Link>
              <Link
                to="/quote-request"
                className="btn btn-lg border-2 border-white/30 bg-white/10 text-white hover:bg-white hover:text-black"
              >
                Request a Quote
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
