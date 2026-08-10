import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { enquiriesService } from '../../services/enquiries.service';
import { productsService } from '../../services/products.service';
import type { Product } from '../../types';
import { Input, Textarea, Button, Card } from '../../components/common';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const QuoteRequestPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get('product');

  const [product, setProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [images, setImages] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    vehicle_details: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (productId) {
      loadProduct(productId);
    }
  }, [productId]);

  const loadProduct = async (id: string) => {
    try {
      const data = await productsService.getProduct(id);
      setProduct(data);
      setFormData(prev => ({
        ...prev,
        message: `I'm interested in: ${data?.name || ''}\nOEM: ${data?.oem_number || 'N/A'}`,
      }));
    } catch (error) {
      console.error('Error loading product:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.customer_name.trim()) newErrors.customer_name = 'Name is required';
    if (!formData.customer_email.trim()) newErrors.customer_email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) newErrors.customer_email = 'Invalid email';
    if (!formData.customer_phone.trim()) newErrors.customer_phone = 'Phone is required';
    if (!formData.vehicle_details.trim()) newErrors.vehicle_details = 'Vehicle details are required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await enquiriesService.submitEnquiry(
        { ...formData, product_id: productId || undefined },
        images
      );
      setIsSuccess(true);
      toast.success('Quote request submitted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-10 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200/60 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-primary-600" />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-dark-900 uppercase tracking-wide mb-2">Request Submitted!</h2>
          <p className="text-metallic-600 mb-8 font-medium">We'll get back to you within 24 hours with pricing and availability.</p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/')} className="w-full btn btn-primary btn-lg">Back to Home</Button>
            <Button onClick={() => navigate('/shop')} variant="outline" className="w-full !border-accent-400 !text-accent-600 hover:!bg-accent-50 font-bold rounded-2xl">Continue Shopping</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Bold */}
      <section className="relative bg-dark-900 text-white overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-400 via-accent-500 to-primary-400" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="container-custom relative z-10 py-12 lg:py-16 text-center">
          <div className="inline-flex items-center justify-center space-x-2 bg-accent-500/20 backdrop-blur-sm border border-accent-500/30 rounded-full px-3.5 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 bg-accent-400 rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold text-accent-400 tracking-wide uppercase">
              24hr Response
            </span>
          </div>
          <h1 className="font-display text-4xl lg:text-5xl font-extrabold tracking-wide uppercase mb-3">
            Request a <span className="text-accent-400">Quote</span>
          </h1>
          <p className="text-base text-metallic-300 max-w-xl mx-auto leading-relaxed">
            Tell us what you need — our team responds with pricing and availability within 24 hours
          </p>
        </div>
      </section>

      <div className="container-custom py-14 lg:py-20">
        <div className="max-w-2xl mx-auto">
          {product && (
            <div className="p-5 mb-8 bg-gradient-to-br from-primary-50 to-primary-100/60 border border-primary-200/60 rounded-2xl">
              <p className="text-sm font-bold text-accent-600 uppercase tracking-widest mb-1">Requesting quote for:</p>
              <p className="font-black text-dark-900 text-lg">{product.name}</p>
            </div>
          )}

          <Card className="p-8 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input label="Full Name" name="customer_name" value={formData.customer_name} onChange={handleChange} error={errors.customer_name} required />
              <Input label="Email Address" name="customer_email" type="email" value={formData.customer_email} onChange={handleChange} error={errors.customer_email} required />
              <Input label="Phone Number" name="customer_phone" value={formData.customer_phone} onChange={handleChange} error={errors.customer_phone} required />
              <Input label="Vehicle Details" name="vehicle_details" value={formData.vehicle_details} onChange={handleChange} error={errors.vehicle_details} required placeholder="e.g., Toyota Corolla 2015" />
              <Textarea label="Message" name="message" value={formData.message} onChange={handleChange} error={errors.message} required rows={5} placeholder="Describe the part you need..." />

              <div>
                <label className="block text-sm font-bold text-metallic-700 mb-2">Upload Images (Optional)</label>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="block w-full text-sm text-metallic-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-primary-50 file:text-primary-700 file:font-bold hover:file:bg-primary-100 file:cursor-pointer" />
                {images.length > 0 && (
                  <div className="flex gap-3 mt-3">
                    {images.map((img, i) => (
                      <div key={i} className="relative">
                        <img src={URL.createObjectURL(img)} alt="" className="w-16 h-16 object-cover rounded-2xl border border-metallic-200" />
                        <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs shadow-lg hover:bg-red-600 transition-colors">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting} className="w-full btn btn-primary btn-lg">
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
