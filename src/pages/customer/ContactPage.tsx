import { useState, useEffect } from 'react';
import { Seo, organizationJsonLd } from '../../components/Seo';
import { settingsService } from '../../services/settings.service';
import type { PlatformSettings } from '../../types';
import { Input, Textarea, Button, Card, Alert } from '../../components/common';
import { WhatsAppIcon } from '../../components/customer/WhatsAppButton';
import { buildWhatsAppLink } from '../../components/customer/WhatsAppButton';
import { generateWhatsAppLink } from '../../utils/helpers';
import { validateEmail, validateRequired } from '../../utils/validation';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export const ContactPage = () => {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [values, setValues] = useState<ContactFormValues>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [whatsAppLink, setWhatsAppLink] = useState('');

  useEffect(() => {
    settingsService.getSettings().then(setSettings).catch(() => {});
    buildWhatsAppLink().then(setWhatsAppLink);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (validateRequired(values.name, 'Name')) newErrors.name = validateRequired(values.name, 'Name')!;
    if (validateRequired(values.email, 'Email')) newErrors.email = validateRequired(values.email, 'Email')!;
    else if (!validateEmail(values.email)) newErrors.email = 'Please enter a valid email address';
    if (validateRequired(values.subject, 'Subject')) newErrors.subject = validateRequired(values.subject, 'Subject')!;
    if (validateRequired(values.message, 'Message')) newErrors.message = validateRequired(values.message, 'Message')!;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Send the enquiry through the enquiries service as a general enquiry
    setIsSubmitting(true);
    try {
      const { enquiriesService } = await import('../../services/enquiries.service');
      await enquiriesService.submitEnquiry({
        customer_name: values.name.trim(),
        customer_email: values.email.trim(),
        customer_phone: values.phone.trim(),
        vehicle_details: values.subject.trim(),
        message: `${values.subject}\n\n${values.message}`.trim(),
      });
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error sending contact message:', error);
      toast.error('Failed to send your message. Please try again or use WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappNumber = settings?.whatsapp_number || import.meta.env.VITE_WHATSAPP_NUMBER || '';

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="Contact Us"
        description="Contact Mexcon Autos for spare parts enquiries, quotes and support. Call, email, WhatsApp or visit us."
        canonicalPath="/contact"
        jsonLd={[organizationJsonLd(settings ? {
          name: settings.company_name,
          email: settings.contact_email,
          phone: settings.contact_phone,
          address: settings.business_address,
        } : undefined)]}
      />

      {/* Hero - Bold */}
      <section className="relative bg-dark-900 text-white overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-400 via-accent-500 to-primary-400" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="container-custom relative z-10 py-12 lg:py-16 text-center">
          <div className="inline-flex items-center justify-center space-x-2 bg-accent-500/20 backdrop-blur-sm border border-accent-500/30 rounded-full px-3.5 py-1.5 mb-5">
            <ChatBubbleLeftRightIcon className="w-4 h-4 text-accent-400" />
            <span className="text-xs font-semibold text-accent-400 tracking-wide uppercase">
              We're here to help
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold leading-tight tracking-tight mb-3">
            Get in <span className="text-accent-400">Touch</span>
          </h1>
          <p className="text-base text-metallic-300 max-w-xl mx-auto leading-relaxed">
            Have a question or need a part sourced? We'd love to hear from you.
          </p>
        </div>
      </section>

      <div className="container-custom py-14 lg:py-20">
        {submitted ? (
          <Card className="max-w-2xl mx-auto p-10 lg:p-14 text-center rounded-3xl border-metallic-200/50 shadow-xl">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200/60 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-dark-900 mb-2 tracking-tight">Message Sent!</h2>
            <p className="text-metallic-600 mb-8 font-medium">
              Thank you for contacting us. We'll get back to you as soon as possible.
            </p>
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-2xl shadow-xl shadow-green-600/25 transition-all duration-300 hover:scale-105"
            >
              <WhatsAppIcon className="w-6 h-6" />
              Chat on WhatsApp
            </a>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-7 rounded-3xl border-metallic-200/50 shadow-sm hover:shadow-xl hover:shadow-accent-500/5 transition-all duration-500">
                <h2 className="text-lg font-bold text-dark-900 mb-5 tracking-tight">Contact Information</h2>
                <div className="space-y-5">
                  <div className="flex items-start space-x-4 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200/60 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <PhoneIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-black text-dark-900">Phone</p>
                      <p className="text-metallic-600 text-sm font-medium">{settings?.contact_phone || 'Coming soon'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200/60 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <EnvelopeIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-black text-dark-900">Email</p>
                      <p className="text-metallic-600 text-sm font-medium">{settings?.contact_email || 'info@mexconautos.com'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200/60 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <MapPinIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-black text-dark-900">Address</p>
                      <p className="text-metallic-600 text-sm font-medium">{settings?.business_address || 'Lagos, Nigeria'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200/60 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <ClockIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-black text-dark-900">Business Hours</p>
                      <p className="text-metallic-600 text-sm font-medium">{settings?.business_hours || 'Mon-Fri: 9AM-6PM, Sat: 9AM-2PM'}</p>
                    </div>
                  </div>

                  {whatsappNumber && (
                    <a
                      href={generateWhatsAppLink(whatsappNumber, 'Hello Mexcon Autos, I have an enquiry.')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start space-x-4 p-4 bg-gradient-to-br from-green-50 to-green-100/60 rounded-2xl border border-green-200/70 hover:border-green-400/60 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <WhatsAppIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-black text-dark-900">WhatsApp</p>
                        <p className="text-metallic-600 text-sm font-medium">Fastest way to reach us</p>
                      </div>
                    </a>
                  )}
                </div>
              </Card>

              {/* Map */}
              <Card className="overflow-hidden rounded-3xl border-metallic-200/50 shadow-sm">
                <div className="p-6 pb-4">
                  <h2 className="text-lg font-black text-dark-900 flex items-center space-x-2 tracking-tight">
                    <MapPinIcon className="w-5 h-5 text-accent-600" />
                    <span>Find Us</span>
                  </h2>
                </div>
                <div className="aspect-[4/3] bg-metallic-100">
                  <iframe
                    title="Mexcon Autos Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253682.21256569885!2d3.2639219999999997!3d6.5243793!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf9c6c8f0d61d%3A0x2ee4e0e8e9d6d9f2!2sLagos%2C%20Nigeria!5e0!3m2!1sen!2sng!4v1700000000000!5m2!1sen!2sng"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <Card className="p-8 lg:p-10 rounded-3xl border-metallic-200/50 shadow-xl hover:shadow-2xl transition-all duration-500">
                <h2 className="text-xl lg:text-2xl font-bold text-dark-900 mb-2 tracking-tight">Send Us a Message</h2>
                <p className="text-metallic-600 mb-8 font-medium">
                  Fill out the form and we'll respond within 24 hours
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Name"
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      error={errors.name}
                      required
                      placeholder="Your full name"
                    />
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      error={errors.email}
                      required
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Phone (optional)"
                      name="phone"
                      type="tel"
                      value={values.phone}
                      onChange={handleChange}
                      placeholder="+234 801 234 5678"
                    />
                    <Input
                      label="Subject"
                      name="subject"
                      value={values.subject}
                      onChange={handleChange}
                      error={errors.subject}
                      required
                      placeholder="What is this about?"
                    />
                  </div>

                  <Textarea
                    label="Message"
                    name="message"
                    value={values.message}
                    onChange={handleChange}
                    error={errors.message}
                    required
                    rows={6}
                    placeholder="Tell us what you need..."
                  />

                  <Button type="submit" isLoading={isSubmitting} className="w-full md:w-auto bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 font-black rounded-2xl shadow-xl shadow-primary-500/30" size="lg">
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-metallic-200/60">
                  <Alert
                    severity="info"
                    message="Prefer to chat? We're available on WhatsApp for quick responses."
                  />
                  <div className="mt-3">
                    <a
                      href={whatsAppLink || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-green-700 font-bold hover:text-green-800 transition-colors"
                    >
                      <ChatBubbleLeftRightIcon className="w-5 h-5" />
                      <span>Chat with us directly on WhatsApp</span>
                    </a>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactPage;
