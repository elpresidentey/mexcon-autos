import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { enquiriesService } from '../../services/enquiries.service';
import type { Enquiry, EnquiryStatus } from '../../types';
import {
  Button,
  Card,
  SearchBar,
  Pagination,
  LoadingSpinner,
  Badge,
  EmptyState,
  Select,
} from '../../components/common';
import { EyeIcon, EnvelopeIcon, CheckCircleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const EnquiriesListPage = () => {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const perPage = 15;

  useEffect(() => {
    loadEnquiries();
  }, [currentPage, searchTerm, statusFilter]);

  const loadEnquiries = async () => {
    try {
      setIsLoading(true);
      const { data, total } = await enquiriesService.getEnquiries(
        {
          search: searchTerm || undefined,
          status: statusFilter || undefined,
        },
        {
          page: currentPage,
          perPage,
        }
      );

      setEnquiries(data);
      setTotalCount(total);
      setTotalPages(Math.ceil(total / perPage));
    } catch (error) {
      console.error('Error loading enquiries:', error);
      toast.error('Failed to load enquiries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as EnquiryStatus | '');
    setCurrentPage(1);
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const csvContent = await enquiriesService.exportEnquiriesToCSV({
        status: statusFilter || undefined,
      });

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `enquiries-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Enquiries exported successfully');
    } catch (error) {
      console.error('Error exporting enquiries:', error);
      toast.error('Failed to export enquiries');
    } finally {
      setIsExporting(false);
    }
  };

  const handleToggleRead = async (id: string) => {
    try {
      await enquiriesService.toggleEnquiryReadStatus(id);
      loadEnquiries();
    } catch (error) {
      console.error('Error toggling read status:', error);
      toast.error('Failed to update read status');
    }
  };

  const getStatusBadgeVariant = (status: EnquiryStatus) => {
    switch (status) {
      case 'new':
        return 'primary';
      case 'contacted':
        return 'warning';
      case 'resolved':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading && enquiries.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Enquiries</h1>
          <p className="text-stone-600 mt-1">Manage customer quote requests</p>
        </div>
        <Button
          onClick={handleExportCSV}
          isLoading={isExporting}
          disabled={isExporting || enquiries.length === 0}
          leftIcon={<ArrowDownTrayIcon className="w-5 h-5" />}
          variant="outline"
        >
          Export CSV
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by customer name, email, or vehicle..."
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={statusFilter} onChange={handleStatusFilterChange}>
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="resolved">Resolved</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Enquiries Table */}
      <Card>
        {enquiries.length === 0 ? (
          <EmptyState
            title="No enquiries found"
            description={searchTerm ? 'Try adjusting your search criteria' : 'New customer enquiries will appear here'}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-stone-200">
                  {enquiries.map((enquiry) => (
                    <tr
                      key={enquiry.id}
                      className={`hover:bg-stone-50 transition-colors cursor-pointer ${
                        !enquiry.is_read ? 'bg-primary-50' : ''
                      }`}
                      onClick={() => navigate(`/admin/enquiries/${enquiry.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {!enquiry.is_read && (
                            <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0" title="Unread" />
                          )}
                          <div>
                            <div className="font-medium text-stone-900">{enquiry.customer_name}</div>
                            {enquiry.vehicle_details && (
                              <div className="text-sm text-stone-500">{enquiry.vehicle_details}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-stone-900">{enquiry.customer_email}</div>
                          {enquiry.customer_phone && (
                            <div className="text-stone-500">{enquiry.customer_phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-stone-900">
                          {enquiry.product?.name || 'General Enquiry'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusBadgeVariant(enquiry.status)}>
                          {enquiry.status.charAt(0).toUpperCase() + enquiry.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-stone-900">{formatDate(enquiry.created_at)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleRead(enquiry.id);
                            }}
                            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                            title={enquiry.is_read ? 'Mark as unread' : 'Mark as read'}
                          >
                            {enquiry.is_read ? (
                              <EnvelopeIcon className="w-5 h-5" />
                            ) : (
                              <CheckCircleIcon className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/enquiries/${enquiry.id}`);
                            }}
                            className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="w-5 h-5" />
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
              <div className="px-6 py-4 border-t border-stone-200">
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
