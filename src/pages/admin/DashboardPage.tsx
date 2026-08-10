import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isAdminUser } from '../../types';
import { productsService } from '../../services/products.service';
import { enquiriesService } from '../../services/enquiries.service';
import { categoriesService } from '../../services/categories.service';
import { brandsService } from '../../services/brands.service';
import { Card, LoadingSpinner, Badge } from '../../components/common';
import type { Product, Enquiry, EnquiryStatus } from '../../types';
import {
  CubeIcon,
  RectangleStackIcon,
  BuildingStorefrontIcon,
  EnvelopeIcon,
  UserGroupIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalBrands: number;
  totalEnquiries: number;
  newEnquiries: number;
  featuredProducts: number;
}

interface EnquiryStatusCount {
  status: EnquiryStatus;
  count: number;
}

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
    totalEnquiries: 0,
    newEnquiries: 0,
    featuredProducts: 0,
  });
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [enquiryStatusCounts, setEnquiryStatusCounts] = useState<EnquiryStatusCount[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load all data in parallel
      const [
        productsData,
        categoriesData,
        brandsData,
        allEnquiriesData,
        newEnquiriesData,
        featuredProductsData,
        topProductsData,
      ] = await Promise.all([
        productsService.getProducts({}, { page: 1, perPage: 1 }),
        categoriesService.getCategories(),
        brandsService.getBrands(),
        enquiriesService.getEnquiries({}, { page: 1, perPage: 10 }),
        enquiriesService.getEnquiries({ status: 'new' }, { page: 1, perPage: 1 }),
        productsService.getProducts({ featured: true }, { page: 1, perPage: 1 }),
        productsService.getProducts({ sort_by: 'view_count', sort_order: 'desc' }, { page: 1, perPage: 10 }),
      ]);

      setStats({
        totalProducts: productsData.total,
        totalCategories: categoriesData.length,
        totalBrands: brandsData.length,
        totalEnquiries: allEnquiriesData.total,
        newEnquiries: newEnquiriesData.total,
        featuredProducts: featuredProductsData.total,
      });

      setRecentEnquiries(allEnquiriesData.data);
      setPopularProducts(topProductsData.data);

      // Calculate enquiry status counts
      const statusCounts = await Promise.all([
        enquiriesService.getEnquiries({ status: 'new' }, { page: 1, perPage: 1 }),
        enquiriesService.getEnquiries({ status: 'contacted' }, { page: 1, perPage: 1 }),
        enquiriesService.getEnquiries({ status: 'resolved' }, { page: 1, perPage: 1 }),
      ]);

      setEnquiryStatusCounts([
        { status: 'new', count: statusCounts[0].total },
        { status: 'contacted', count: statusCounts[1].total },
        { status: 'resolved', count: statusCounts[2].total },
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Products',
      value: stats.totalProducts.toString(),
      icon: CubeIcon,
      color: 'bg-primary-500',
      href: '/admin/products',
    },
    {
      label: 'Categories',
      value: stats.totalCategories.toString(),
      icon: RectangleStackIcon,
      color: 'bg-green-500',
      href: '/admin/categories',
    },
    {
      label: 'Brands',
      value: stats.totalBrands.toString(),
      icon: BuildingStorefrontIcon,
      color: 'bg-purple-500',
      href: '/admin/brands',
    },
    {
      label: 'New Enquiries',
      value: stats.newEnquiries.toString(),
      icon: EnvelopeIcon,
      color: 'bg-orange-500',
      href: '/admin/enquiries',
    },
    {
      label: 'Featured Products',
      value: stats.featuredProducts.toString(),
      icon: EyeIcon,
      color: 'bg-pink-500',
      href: '/admin/products?featured=true',
    },
    {
      label: 'Total Enquiries',
      value: stats.totalEnquiries.toString(),
      icon: UserGroupIcon,
      color: 'bg-indigo-500',
      href: '/admin/enquiries',
    },
  ];

  const getStatusBadgeVariant = (status: EnquiryStatus) => {
    switch (status) {
      case 'new':
        return 'warning';
      case 'contacted':
        return 'info';
      case 'resolved':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: EnquiryStatus) => {
    switch (status) {
      case 'new':
        return 'New';
      case 'contacted':
        return 'Contacted';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-stone-600 mt-2">
          Welcome back, {isAdminUser(user) ? user.name : 'Admin'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <button
            key={index}
            onClick={() => navigate(stat.href)}
            className="text-left w-full"
          >
            <Card hover className="p-6 h-full">
              <div className="flex items-center space-x-4">
                <div className={`${stat.color} p-3 rounded-lg flex-shrink-0`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>

      {/* Enquiry Status Breakdown */}
      {stats.totalEnquiries > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">
            Enquiries by Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {enquiryStatusCounts.map((statusCount) => (
              <div
                key={statusCount.status}
                className="flex items-center justify-between p-4 bg-stone-50 rounded-lg"
              >
                <div>
                  <Badge variant={getStatusBadgeVariant(statusCount.status)}>
                    {getStatusLabel(statusCount.status)}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-stone-900">{statusCount.count}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enquiries */}
        <Card>
          <div className="p-6 border-b border-stone-200">
            <h2 className="text-lg font-semibold text-stone-900">
              Recent Enquiries
            </h2>
          </div>
          <div className="p-6">
            {recentEnquiries.length === 0 ? (
              <div className="text-center py-8 text-stone-600">
                <EnvelopeIcon className="w-12 h-12 mx-auto mb-3 text-stone-400" />
                <p>No enquiries yet</p>
                <p className="text-sm mt-1">Enquiries will appear here when customers submit quote requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEnquiries.map((enquiry) => (
                  <button
                    key={enquiry.id}
                    onClick={() => navigate(`/admin/enquiries/${enquiry.id}`)}
                    className="w-full text-left p-4 border border-stone-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-stone-900">{enquiry.customer_name}</p>
                      <Badge variant={getStatusBadgeVariant(enquiry.status)}>
                        {getStatusLabel(enquiry.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-stone-600 line-clamp-2">{enquiry.message}</p>
                    <p className="text-xs text-stone-400 mt-2">
                      {new Date(enquiry.created_at).toLocaleDateString()}
                    </p>
                  </button>
                ))}
                {recentEnquiries.length >= 10 && (
                  <button
                    onClick={() => navigate('/admin/enquiries')}
                    className="w-full text-center py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View all enquiries →
                  </button>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Popular Products */}
        <Card>
          <div className="p-6 border-b border-stone-200">
            <h2 className="text-lg font-semibold text-stone-900">
              Most Popular Products
            </h2>
          </div>
          <div className="p-6">
            {popularProducts.length === 0 ? (
              <div className="text-center py-8 text-stone-600">
                <CubeIcon className="w-12 h-12 mx-auto mb-3 text-stone-400" />
                <p>No products yet</p>
                <p className="text-sm mt-1">
                  <button
                    onClick={() => navigate('/admin/products/new')}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    Add your first product
                  </button>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {popularProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                    className="w-full text-left p-4 border border-stone-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-stone-900 flex-1 line-clamp-1">{product.name}</p>
                      {product.is_featured && (
                        <Badge variant="warning" className="ml-2">Featured</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-stone-600">
                      <div className="flex items-center space-x-1">
                        <EyeIcon className="w-4 h-4" />
                        <span>{product.view_count} views</span>
                      </div>
                      {product.oem_number && (
                        <span className="text-xs">OEM: {product.oem_number}</span>
                      )}
                    </div>
                  </button>
                ))}
                {popularProducts.length >= 10 && (
                  <button
                    onClick={() => navigate('/admin/products')}
                    className="w-full text-center py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View all products →
                  </button>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <div className="p-6 border-b border-stone-200">
          <h2 className="text-lg font-semibold text-stone-900">
            Quick Actions
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/admin/products/new')}
              className="p-4 border-2 border-dashed border-stone-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
            >
              <CubeIcon className="w-8 h-8 mx-auto mb-2 text-stone-600" />
              <p className="font-medium text-stone-900">Add Product</p>
            </button>
            <button
              onClick={() => navigate('/admin/categories')}
              className="p-4 border-2 border-dashed border-stone-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
            >
              <RectangleStackIcon className="w-8 h-8 mx-auto mb-2 text-stone-600" />
              <p className="font-medium text-stone-900">Manage Categories</p>
            </button>
            <button
              onClick={() => navigate('/admin/brands')}
              className="p-4 border-2 border-dashed border-stone-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
            >
              <BuildingStorefrontIcon className="w-8 h-8 mx-auto mb-2 text-stone-600" />
              <p className="font-medium text-stone-900">Manage Brands</p>
            </button>
            <button
              onClick={() => navigate('/admin/enquiries')}
              className="p-4 border-2 border-dashed border-stone-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
            >
              <EnvelopeIcon className="w-8 h-8 mx-auto mb-2 text-stone-600" />
              <p className="font-medium text-stone-900">View Enquiries</p>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
