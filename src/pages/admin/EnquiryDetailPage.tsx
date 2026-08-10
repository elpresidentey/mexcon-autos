import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { enquiriesService } from '../../services/enquiries.service';
import type { Enquiry, EnquiryStatus } from '../../types';
import {
  Button,
  Card,
  LoadingSpinner,
  Badge,
  Breadcrumbs,
  Select,
  Textarea,
} from '../../components/common';
import { ArrowLeftIcon, PhoneIcon, EnvelopeIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const EnquiryDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newStatus, setNewStatus] = useState<EnquiryStatus>('new');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    if (id) {
      loadEnquiry(id);
    }
  }, [id]);

  const loadEnquiry = async (enquiryId: string) => {
    try {
      setIsLoading(true);
      const data = await enquiriesService.getEnquiry(enquiryId);
      
      if (!data) {
        toast.error('Enquiry not found');
        navigate('/admin/enquiries');
        return;
      }

      setEnquiry(data);
      setNewStatus(data.status);

      // Mark as read if not already
      if (!data.is_read) {
        await enquiriesService.toggleEnquiryReadStatus(enquiryId);
      }
    } catch (error) {
      console.error('Error loading enquiry:', error);
      toast.error('Failed to load enquiry');
      navigate('/admin/enquiries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!id || !enquiry) return;

    if (newStatus === enquiry.status && !newNotes.trim()) {
      toast.error('No changes to save');
      return;
    }

    setIsSaving(true);

    try {
      await enquiriesService.updateEnquiryStatus(id, newStatus, newNotes.trim() || undefined);
      toast.success('Enquiry updated successfully');
      setNewNotes('');
      loadEnquiry(id);
    } catch (error: any) {
      console.error('Error updating enquiry:', error);
      toast.error(error.message || 'Failed to update enquiry');
    } finally {
      setIsSaving(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (!enquiry?.customer_phone) return;
    
    // Remove all non-digit characters
    const cleanPhone = enquiry.customer_phone.replace(/\D/g, '');
    
    // Construct WhatsApp URL
    const message = `Hello ${enquiry.customer_name}, regarding your enquiry about ${enquiry.product?.name || 'spare parts'}.`;
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!enquiry) {
    return null;
  }

  const breadcrumbs = [
    { label: 'Enquiries', href: '/admin/enquiries' },
    { label: `Enquiry #${enquiry.id.slice(0, 8)}` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Breadcrumbs items={breadcrumbs} />
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Enquiry Details</h1>
            <p className="text-stone-600 mt-1">Submitted on {formatDate(enquiry.created_at)}</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/enquiries')} leftIcon={<ArrowLeftIcon className="w-5 h-5" />}>
            Back to Enquiries
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
                <p className="text-stone-900">{enquiry.customer_name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                <a
                  href={`mailto:${enquiry.customer_email}`}
                  className="text-primary-600 hover:text-primary-700 flex items-center space-x-2"
                >
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>{enquiry.customer_email}</span>
                </a>
              </div>

              {enquiry.customer_phone && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="w-4 h-4 text-stone-500" />
                    <span className="text-stone-900">{enquiry.customer_phone}</span>
                  </div>
                </div>
              )}

              {enquiry.vehicle_details && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Vehicle Details</label>
                  <p className="text-stone-900">{enquiry.vehicle_details}</p>
                </div>
              )}
            </div>

            {enquiry.customer_phone && (
              <div className="mt-6 pt-6 border-t border-stone-200">
                <Button onClick={handleWhatsAppClick} variant="outline" leftIcon={<ChatBubbleLeftIcon className="w-5 h-5" />}>
                  Contact via WhatsApp
                </Button>
              </div>
            )}
          </Card>

          {/* Product Information */}
          {enquiry.product && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-stone-900 mb-4">Product Information</h2>
              <div className="flex items-center space-x-4">
                {enquiry.product.images?.[0]?.url && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                    <img
                      src={enquiry.product.images[0].url}
                      alt={enquiry.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-stone-900">{enquiry.product.name}</h3>
                  <p className="text-sm text-stone-600 mt-1">
                    {enquiry.product.category?.name} • {enquiry.product.brand?.name}
                  </p>
                  {enquiry.product.oem_number && (
                    <p className="text-sm text-stone-500 mt-1">OEM: {enquiry.product.oem_number}</p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Customer Message */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-4">Customer Message</h2>
            <p className="text-stone-900 whitespace-pre-wrap">{enquiry.message}</p>
          </Card>

          {/* Enquiry Images */}
          {enquiry.images && enquiry.images.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-stone-900 mb-4">Attached Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {enquiry.images.map((image) => (
                  <a
                    key={image.id}
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg overflow-hidden bg-stone-100 hover:shadow-lg transition-shadow"
                  >
                    <img src={image.url} alt="Enquiry attachment" className="w-full h-32 object-cover" />
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* Admin Notes */}
          {enquiry.admin_notes && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-stone-900 mb-4">Notes History</h2>
              <div className="bg-stone-50 rounded-lg p-4">
                <p className="text-stone-900 whitespace-pre-wrap text-sm">{enquiry.admin_notes}</p>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-4">Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Current Status</label>
                <Badge variant={getStatusBadgeVariant(enquiry.status)} className="text-base px-4 py-2">
                  {enquiry.status.charAt(0).toUpperCase() + enquiry.status.slice(1)}
                </Badge>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Update Status</label>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as EnquiryStatus)}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="resolved">Resolved</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Add Notes</label>
                <Textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Add notes about this enquiry..."
                  rows={4}
                />
              </div>

              <Button
                onClick={handleUpdateStatus}
                isLoading={isSaving}
                disabled={isSaving}
                className="w-full"
              >
                Update Enquiry
              </Button>
            </div>
          </Card>

          {/* Metadata Card */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-4">Details</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-stone-600">Enquiry ID:</span>
                <p className="text-stone-900 font-mono mt-1">{enquiry.id}</p>
              </div>
              <div>
                <span className="text-stone-600">Submitted:</span>
                <p className="text-stone-900 mt-1">{formatDate(enquiry.created_at)}</p>
              </div>
              <div>
                <span className="text-stone-600">Last Updated:</span>
                <p className="text-stone-900 mt-1">{formatDate(enquiry.updated_at || enquiry.created_at)}</p>
              </div>
              <div>
                <span className="text-stone-600">Read Status:</span>
                <p className="text-stone-900 mt-1">{enquiry.is_read ? 'Read' : 'Unread'}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
