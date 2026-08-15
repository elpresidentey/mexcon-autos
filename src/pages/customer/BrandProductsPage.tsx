import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { productsService } from '../../services/products.service';
import { brandsService } from '../../services/brands.service';
import type { Product, Brand } from '../../types';
import { ProductCard } from '../../components/customer/ProductCard';
import { SearchBar, Pagination, LoadingSpinner, EmptyState, Breadcrumbs } from '../../components/common';

export const BrandProductsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const perPage = 12;

  // Debounced search term so typing does not fire a query per keystroke
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '');
  // Guard against stale async responses overwriting newer ones
  const requestSeq = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (slug) {
      loadBrandAndProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, debouncedSearch, currentPage]);

  const loadBrandAndProducts = async () => {
    const seq = ++requestSeq.current;
    try {
      setIsLoading(true);

      const brandData = await brandsService.getBrandBySlug(slug!);
      if (!brandData) return;

      setBrand(brandData);

      const { data, total } = await productsService.getProducts({
        brand_id: brandData.id,
        search: debouncedSearch || undefined,
        is_active: true,
      }, { page: currentPage, perPage });

      if (seq !== requestSeq.current) return;
      setProducts(data);
      setTotalCount(total);
      setTotalPages(Math.ceil(total / perPage));
    } catch (error) {
      console.error('Error loading brand products:', error);
    } finally {
      if (requestSeq.current === seq) setIsLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Brands', href: '/brands' },
    ...(brand ? [{ label: brand.name }] : []),
  ];

  if (isLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><LoadingSpinner /></div>;
  }

  if (!brand) {
    return <EmptyState title="Brand not found" />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Bold */}
      <section className="relative bg-dark-900 text-white overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-400 via-accent-500 to-primary-400" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="container-custom relative z-10 py-16 lg:py-20">
          <Breadcrumbs items={breadcrumbItems} onDark className="mb-8" />
          <div className="flex items-center space-x-5 mb-4">
            {brand.logo_url && (
              <div className="w-20 h-20 bg-white rounded-2xl p-2.5 shadow-2xl shadow-dark-900/50 flex-shrink-0">
                <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain" />
              </div>
            )}
            <h1 className="font-display text-4xl lg:text-5xl font-extrabold tracking-wide uppercase mb-3">
              <span className="text-accent-400">{brand.name}</span>
            </h1>
          </div>
          {brand.description && <p className="text-metallic-300 text-base leading-relaxed pb-2">{brand.description}</p>}
          <div className="max-w-2xl mt-8">
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search products..." className="bg-white rounded-2xl shadow-2xl shadow-dark-900/50" />
          </div>
        </div>
      </section>

      <div className="container-custom py-10 lg:py-14">
        <div className="flex items-center justify-between mb-8">
          <p className="text-metallic-600 font-medium">
            Showing <span className="font-black text-dark-900">{products.length}</span> of <span className="font-black text-dark-900">{totalCount}</span> products
          </p>
        </div>

        {products.length === 0 ? (
          <div className="card p-12">
            <EmptyState title="No products found" description="Try adjusting your search" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
