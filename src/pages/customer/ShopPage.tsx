import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsService } from '../../services/products.service';
import { categoriesService } from '../../services/categories.service';
import { brandsService } from '../../services/brands.service';
import type { Product, Category, Brand } from '../../types';
import { ProductCard } from '../../components/customer/ProductCard';
import { VehicleSearch } from '../../components/customer/VehicleSearch';
import {
  SearchBar,
  Select,
  Pagination,
  LoadingSpinner,
  EmptyState,
  Button,
} from '../../components/common';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [selectedYear, setSelectedYear] = useState(searchParams.get('year') || '');
  const [selectedManufacturer, setSelectedManufacturer] = useState(searchParams.get('manufacturer') || '');
  const [selectedModel, setSelectedModel] = useState(searchParams.get('model') || '');
  const [selectedEngineType, setSelectedEngineType] = useState(searchParams.get('engine_type') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'created_at');
  
  const [currentPage, setCurrentPage] = useState(Math.max(1, parseInt(searchParams.get('page') || '1') || 1));
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const perPage = 12;

  // Guard against stale async responses overwriting newer ones
  const requestSeq = useRef(0);
  // Debounced search term so typing does not fire a query per keystroke
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Generate year options (last 30 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 30 }, (_, i) => currentYear - i);

  useEffect(() => {
    loadFilters();
  }, []);

  // Sync state when URL params change (e.g. via VehicleSearch navigation)
  useEffect(() => {
    const m = searchParams.get('manufacturer');
    const mdl = searchParams.get('model');
    const eng = searchParams.get('engine_type');
    const yr = searchParams.get('year');
    const s = searchParams.get('search');
    const cat = searchParams.get('category');
    const br = searchParams.get('brand');
    const sort = searchParams.get('sort');
    const page = parseInt(searchParams.get('page') || '1');

    if (m !== null) setSelectedManufacturer(m);
    if (mdl !== null) setSelectedModel(mdl);
    if (eng !== null) setSelectedEngineType(eng);
    if (yr !== null) setSelectedYear(yr);
    if (s !== null) setSearchTerm(s);
    if (cat !== null) setSelectedCategory(cat);
    if (br !== null) setSelectedBrand(br);
    if (sort !== null) setSortBy(sort);
    if (page > 0 && page !== currentPage) setCurrentPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    loadProducts();
    updateURLParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedCategory, selectedBrand, selectedYear, selectedManufacturer, selectedModel, selectedEngineType, sortBy, currentPage]);

  const updateURLParams = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedBrand) params.set('brand', selectedBrand);
    if (selectedYear) params.set('year', selectedYear);
    if (selectedManufacturer) params.set('manufacturer', selectedManufacturer);
    if (selectedModel) params.set('model', selectedModel);
    if (selectedEngineType) params.set('engine_type', selectedEngineType);
    if (sortBy !== 'created_at') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    setSearchParams(params, { replace: true });
  };

  const loadFilters = async () => {
    try {
      const [categoriesData, brandsData] = await Promise.all([
        categoriesService.getCategories(),
        brandsService.getBrands(),
      ]);
      
      setCategories(categoriesData.filter(c => c.is_active));
      setBrands(brandsData.filter(b => b.is_active));
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  const loadProducts = async () => {
    const seq = ++requestSeq.current;
    try {
      setIsLoading(true);

      const { data, total } = await productsService.searchProducts({
        search: debouncedSearch || undefined,
        category_id: selectedCategory || undefined,
        brand_id: selectedBrand || undefined,
        year: selectedYear ? parseInt(selectedYear) : undefined,
        manufacturer: selectedManufacturer || undefined,
        model: selectedModel || undefined,
        engine_type: selectedEngineType || undefined,
        is_active: true,
        sort_by: resolveSort(sortBy, debouncedSearch).sortBy,
        sort_order: resolveSort(sortBy, debouncedSearch).sortOrder,
      }, {
        page: currentPage,
        perPage,
      });

      // Discard responses from superseded requests
      if (seq !== requestSeq.current) return;

      setProducts(data);
      setTotalCount(total);
      setTotalPages(Math.ceil(total / perPage));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      if (requestSeq.current === seq) setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedYear('');
    setSelectedManufacturer('');
    setSelectedModel('');
    setSelectedEngineType('');
    setSortBy('created_at');
    setCurrentPage(1);
  };

  const resolveSort = (value: string, activeSearch?: string): { sortBy: string; sortOrder: 'asc' | 'desc' } => {
    switch (value) {
      case 'price_asc':
        return { sortBy: 'price', sortOrder: 'asc' };
      case 'price_desc':
        return { sortBy: 'price', sortOrder: 'desc' };
      case 'name':
        return { sortBy: 'name', sortOrder: 'asc' };
      case 'view_count':
        return { sortBy: 'view_count', sortOrder: 'desc' };
      case 'relevance':
        return { sortBy: 'relevance', sortOrder: 'desc' };
      default:
        return { sortBy: activeSearch ? 'relevance' : 'created_at', sortOrder: 'desc' };
    }
  };

  // Popular Japanese & Korean brands shown as quick-filter chips
  const popularBrandNames = [
    'Toyota', 'Honda', 'Nissan', 'Mitsubishi', 'Mazda', 'Subaru', 'Suzuki',
    'Hyundai', 'Kia', 'Genesis',
  ];
  const popularBrands = popularBrandNames
    .map((name) => brands.find((b) => b.name === name))
    .filter((b): b is Brand => Boolean(b));

  const hasActiveFilters = searchTerm || selectedCategory || selectedBrand || selectedYear || selectedManufacturer || selectedModel || selectedEngineType;

  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-400 via-accent-500 to-primary-400" />

        <div className="container-custom relative z-10 py-12 lg:py-16">
          <h1 className="font-display text-5xl lg:text-6xl font-extrabold tracking-wide uppercase leading-none mb-3">
            Shop Parts
          </h1>
          <p className="text-base lg:text-lg text-white/70 max-w-xl leading-relaxed mb-8">
            Search by part name, OEM number, or vehicle — we confirm availability within 24 hours.
          </p>

          <div className="max-w-2xl">
            <SearchBar
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by part name, OEM number, part number..."
              className="bg-white rounded-xl shadow-xl"
            />
          </div>

          <div className="mt-8 max-w-5xl">
            <VehicleSearch variant="hero" />
          </div>

          {popularBrands.length > 0 && (
            <div className="mt-8">
              <p className="text-sm font-semibold text-white/60 uppercase tracking-[0.16em] mb-3">Popular Brands</p>
              <div className="flex flex-wrap gap-3">
                {popularBrands.map((brand) => {
                  const isActive = selectedBrand === brand.id;
                  return (
                    <button
                      key={brand.id}
                      onClick={() => {
                        setSelectedBrand(isActive ? '' : brand.id);
                        setCurrentPage(1);
                      }}
className={`px-5 py-2.5 text-sm font-medium rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 ${
  isActive
    ? 'bg-white text-black border-white shadow-lg'
    : 'bg-white/5 text-white/80 border-white/20 hover:border-accent-400 hover:text-white hover:bg-white/10'
}`}
                    >
                      {brand.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="container-custom py-14 lg:py-20">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-8">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-lg font-bold tracking-wide uppercase text-ink flex items-center gap-2">
                    <FunnelIcon className="w-4 h-4 text-primary-600" />
                    Filters
                  </h2>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className="text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  <Select
                    label="Category"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="Brand"
                    value={selectedBrand}
                    onChange={(e) => {
                      setSelectedBrand(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">All Brands</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="Year"
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">All Years</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="Sort By"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="">{debouncedSearch ? 'Best Match (Default)' : 'Newest First (Default)'}</option>
                    <option value="relevance">Best Match</option>
                    <option value="created_at">Newest First</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="view_count">Most Popular</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </Select>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              leftIcon={<FunnelIcon className="w-5 h-5" />}
              className="w-full !border-metallic-300 !text-ink hover:!bg-metallic-50 font-semibold"
            >
              {isFiltersOpen ? 'Hide Filters' : 'Show Filters'}
              {hasActiveFilters && ` (${[selectedCategory, selectedBrand, selectedYear].filter(Boolean).length})`}
            </Button>

            {isFiltersOpen && (
              <div className="mt-4 card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-lg font-bold tracking-wide uppercase text-ink flex items-center gap-2">
                    <FunnelIcon className="w-4 h-4 text-primary-600" />
                    Filters
                  </h2>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className="text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  <Select
                    label="Category"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="Brand"
                    value={selectedBrand}
                    onChange={(e) => {
                      setSelectedBrand(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">All Brands</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="Year"
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">All Years</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="Sort By"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="">{debouncedSearch ? 'Best Match (Default)' : 'Newest First (Default)'}</option>
                    <option value="relevance">Best Match</option>
                    <option value="created_at">Newest First</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="view_count">Most Popular</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </Select>
                </div>
              </div>
          )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <p className="text-base text-metallic-600">
                {isLoading ? (
                  'Loading...'
                ) : (
                  <>
                    Showing <span className="font-semibold text-ink">{products.length}</span> of{' '}
                    <span className="font-semibold text-ink">{totalCount}</span> products
                  </>
                )}
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner />
              </div>
            ) : products.length === 0 ? (
              <div className="card p-12">
                <EmptyState
                  title="No products found"
                  description={
                    hasActiveFilters
                      ? 'Try adjusting your filters or search terms'
                      : 'Check back soon for new products'
                  }
                  action={
                    hasActiveFilters ? (
                      <Button onClick={handleClearFilters} leftIcon={<XMarkIcon className="w-5 h-5" />}>
                        Clear Filters
                      </Button>
                    ) : undefined
                  }
                />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
