import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsService } from '../../services/products.service';
import type { Product } from '../../types';
import {
  Button,
  Card,
  SearchBar,
  Pagination,
  LoadingSpinner,
  Badge,
  EmptyState,
} from '../../components/common';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const ProductsListPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [reloadKey, setReloadKey] = useState(0);
  const perPage = 10;

  useEffect(() => {
    let cancelled = false;

    productsService
      .getProducts(
        {
          search: searchTerm || undefined,
          isActive: activeFilter,
        },
        {
          page: currentPage,
          perPage,
        }
      )
      .then(({ data, total }) => {
        if (cancelled) return;
        setProducts(data);
        setTotalCount(total);
        setTotalPages(Math.ceil(total / perPage));
      })
      .catch((error) => {
        console.error('Error loading products:', error);
        toast.error('Failed to load products');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentPage, searchTerm, activeFilter, reloadKey]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await productsService.deleteProduct(id);
      toast.success('Product deleted successfully');
      setReloadKey((k) => k + 1);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete product');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await productsService.toggleProductActive(id);
      toast.success('Product status updated');
      setReloadKey((k) => k + 1);
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update product status');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price);
  };

  if (isLoading && products.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold uppercase tracking-wide text-ink">Products</h1>
          <p className="text-metallic-600 mt-1">Manage your product catalogue</p>
        </div>
        <Button onClick={() => navigate('/admin/products/new')} leftIcon={<PlusIcon className="w-5 h-5" />}>
          Add Product
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search products by name, OEM, part number..."
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeFilter === undefined ? 'primary' : 'outline'}
              onClick={() => setActiveFilter(undefined)}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={activeFilter === true ? 'primary' : 'outline'}
              onClick={() => setActiveFilter(true)}
              size="sm"
            >
              Active
            </Button>
            <Button
              variant={activeFilter === false ? 'primary' : 'outline'}
              onClick={() => setActiveFilter(false)}
              size="sm"
            >
              Inactive
            </Button>
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Card>
        {products.length === 0 ? (
          <EmptyState
            title="No products found"
            description={searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first product'}
            action={
              !searchTerm ? (
                <Button onClick={() => navigate('/admin/products/new')} leftIcon={<PlusIcon className="w-5 h-5" />}>
                  Add Product
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-metallic-50 border-b border-metallic-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-metallic-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-metallic-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-metallic-500 uppercase tracking-wider">
                      Brand
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-metallic-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-metallic-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-metallic-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-metallic-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-metallic-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-metallic-100 flex-shrink-0">
                            {product.images?.[0]?.url ? (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-metallic-400">
                                <PlusIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-ink">{product.name}</div>
                            {product.oem_number && (
                              <div className="text-sm text-metallic-500">OEM: {product.oem_number}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-ink">{product.category?.name || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-ink">{product.brand?.name || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-ink">{formatPrice(product.price)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <Badge variant={product.is_active ? 'success' : 'secondary'}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {product.stock_status === 'out_of_stock' && (
                            <Badge variant="error">Out of Stock</Badge>
                          )}
                          {product.stock_status === 'low_stock' && (
                            <Badge variant="warning">Low Stock</Badge>
                          )}
                          {product.stock_status === 'pre_order' && (
                            <Badge variant="info">Pre-Order</Badge>
                          )}
                          {product.condition_label && product.condition_label !== 'genuine' && (
                            <Badge variant="secondary">
                              {product.condition_label === 'oem_equivalent'
                                ? 'OEM Equivalent'
                                : product.condition_label.charAt(0).toUpperCase() + product.condition_label.slice(1)}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleToggleActive(product.id)}
                            className="p-2 text-metallic-600 hover:text-ink hover:bg-metallic-100 rounded-lg transition-colors"
                            title={product.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {product.is_active ? (
                              <EyeSlashIcon className="w-5 h-5" />
                            ) : (
                              <EyeIcon className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                            className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-metallic-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={totalCount}
                  itemsPerPage={perPage}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};
