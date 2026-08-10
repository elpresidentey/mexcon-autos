import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesService } from '../../services/categories.service';
import type { Category } from '../../types';
import { CategoryCard } from '../../components/customer/CategoryCard';
import { LoadingSpinner, EmptyState } from '../../components/common';
import { RectangleStackIcon } from '@heroicons/react/24/outline';

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<(Category & { product_count?: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoriesService.getCategoriesWithProductCounts();
      // Only show active categories that currently have stock
      const activeCategories = data
        .filter((c) => c.is_active && (c.product_count || 0) > 0)
        .sort((a, b) => (b.product_count || 0) - (a.product_count || 0));
      setCategories(activeCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-dark-900 text-white overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-accent-500" />
        <div className="container-custom relative z-10 py-12 lg:py-16 text-center">
          <div className="inline-flex items-center justify-center space-x-2 bg-accent-500 border border-accent-500 rounded-full px-3.5 py-1.5 mb-5">
            <RectangleStackIcon className="w-4 h-4 text-black" />
            <span className="text-xs font-bold text-black tracking-wide uppercase">
              Browse by Category
            </span>
          </div>
          <h1 className="font-display text-4xl lg:text-5xl font-extrabold tracking-wide uppercase mb-3">
            Explore Our <span className="text-accent-400">Range</span>
          </h1>
          <p className="text-base text-metallic-200 max-w-xl mx-auto leading-relaxed">
            Every component for your Japanese and Korean vehicle — organized, searchable and ready to source
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <div className="container-custom py-14 lg:py-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-12">
            <EmptyState
              title="No categories available"
              description="Check back soon for new categories"
            />
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <p className="text-metallic-700">
                Showing <span className="font-black text-dark-900">{categories.length}</span> categories
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-dark-900 text-white py-14 lg:py-16">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl lg:text-4xl font-extrabold tracking-wide uppercase mb-3">
              Find the Right <span className="text-accent-400">Parts</span> for Your Vehicle
            </h2>
            <p className="text-metallic-200 text-sm lg:text-base leading-relaxed mb-6">
              Our extensive catalogue covers all major components for Japanese and Korean vehicles.
              Can't find what you're looking for? Contact us and we'll help you source the right part.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/shop"
                className="btn btn-accent btn-lg"
              >
                Browse All Products
              </Link>
              <Link
                to="/contact"
                className="btn btn-lg bg-white text-dark-900 hover:bg-metallic-100"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
