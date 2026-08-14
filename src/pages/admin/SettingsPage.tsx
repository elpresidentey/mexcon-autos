import { useState, useEffect } from 'react';
import { settingsService } from '../../services/settings.service';
import type { PlatformSettings } from '../../types';
import {
  Button,
  Card,
  Input,
  Textarea,
  LoadingSpinner,
} from '../../components/common';
import { 
  BuildingOfficeIcon, 
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const SettingsPage = () => {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    company_name: '',
    contact_phone: '',
    contact_email: '',
    business_address: '',
    whatsapp_number: '',
    business_hours: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    social_media_links: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await settingsService.getSettings();
      if (data) {
        setSettings(data);
        setFormData({
          company_name: data.company_name || '',
          contact_phone: data.contact_phone || '',
          contact_email: data.contact_email || '',
          business_address: data.business_address || '',
          whatsapp_number: data.whatsapp_number || '',
          business_hours: data.business_hours || '',
          seo_title: data.seo_title || '',
          seo_description: data.seo_description || '',
          seo_keywords: data.seo_keywords || '',
          social_media_links: {
            facebook: data.social_media_links?.facebook || '',
            instagram: data.social_media_links?.instagram || '',
            twitter: data.social_media_links?.twitter || '',
            linkedin: data.social_media_links?.linkedin || '',
          },
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Handle social media links separately
    if (name.startsWith('social_')) {
      const socialPlatform = name.replace('social_', '');
      setFormData((prev) => ({
        ...prev,
        social_media_links: {
          ...prev.social_media_links,
          [socialPlatform]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required';
    }

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Invalid email address';
    }

    if (formData.contact_phone && !/^[0-9+\s()-]+$/.test(formData.contact_phone)) {
      newErrors.contact_phone = 'Invalid phone number format';
    }

    if (formData.whatsapp_number && !/^[0-9+\s()-]+$/.test(formData.whatsapp_number)) {
      newErrors.whatsapp_number = 'Invalid WhatsApp number format';
    }

    // Validate URLs
    const urlFields = ['facebook', 'instagram', 'twitter', 'linkedin'];
    urlFields.forEach((field) => {
      const url = formData.social_media_links[field as keyof typeof formData.social_media_links];
      if (url && !url.match(/^https?:\/\/.+/)) {
        newErrors[`social_${field}`] = 'URL must start with http:// or https://';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    setIsSaving(true);

    try {
      await settingsService.updateSettings(formData);
      toast.success('Settings saved successfully');
      loadSettings();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl lg:text-4xl font-extrabold uppercase tracking-wide text-ink">Platform Settings</h1>
        <p className="text-metallic-600 mt-1">Manage your business information and platform configuration</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <BuildingOfficeIcon className="w-6 h-6 text-primary-600" />
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink">Company Information</h2>
          </div>

          <div className="space-y-4">
            <Input
              label="Company Name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              error={errors.company_name}
              required
              placeholder="Mexcon Autos"
            />

            <Input
              label="Contact Email"
              name="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={handleChange}
              error={errors.contact_email}
              placeholder="info@mexconautos.com"
            />

            <Input
              label="Contact Phone"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
              error={errors.contact_phone}
              placeholder="+234 XXX XXX XXXX"
            />

            <Textarea
              label="Business Address"
              name="business_address"
              value={formData.business_address}
              onChange={handleChange}
              rows={3}
              placeholder="Enter your business address..."
            />

            <Input
              label="Business Hours"
              name="business_hours"
              value={formData.business_hours}
              onChange={handleChange}
              placeholder="Mon-Fri: 9:00 AM - 6:00 PM"
              helperText="Display format for customers"
            />
          </div>
        </Card>

        {/* WhatsApp Configuration */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary-600" />
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink">WhatsApp Integration</h2>
          </div>

          <div className="space-y-4">
            <Input
              label="WhatsApp Business Number"
              name="whatsapp_number"
              value={formData.whatsapp_number}
              onChange={handleChange}
              error={errors.whatsapp_number}
              placeholder="+234XXXXXXXXXX"
              helperText="Include country code (e.g., +234)"
            />
          </div>
        </Card>

        {/* Social Media Links */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <GlobeAltIcon className="w-6 h-6 text-primary-600" />
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink">Social Media Links</h2>
          </div>

          <div className="space-y-4">
            <Input
              label="Facebook"
              name="social_facebook"
              value={formData.social_media_links.facebook}
              onChange={handleChange}
              error={errors.social_facebook}
              placeholder="https://facebook.com/mexconautos"
            />

            <Input
              label="Instagram"
              name="social_instagram"
              value={formData.social_media_links.instagram}
              onChange={handleChange}
              error={errors.social_instagram}
              placeholder="https://instagram.com/mexconautos"
            />

            <Input
              label="Twitter / X"
              name="social_twitter"
              value={formData.social_media_links.twitter}
              onChange={handleChange}
              error={errors.social_twitter}
              placeholder="https://twitter.com/mexconautos"
            />

            <Input
              label="LinkedIn"
              name="social_linkedin"
              value={formData.social_media_links.linkedin}
              onChange={handleChange}
              error={errors.social_linkedin}
              placeholder="https://linkedin.com/company/mexconautos"
            />
          </div>
        </Card>

        {/* SEO Settings */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <GlobeAltIcon className="w-6 h-6 text-primary-600" />
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink">SEO Configuration</h2>
          </div>

          <div className="space-y-4">
            <Input
              label="SEO Title"
              name="seo_title"
              value={formData.seo_title}
              onChange={handleChange}
              placeholder="Mexcon Autos - Japanese & Korean Auto Spare Parts"
              helperText="Displayed in search results and browser tabs"
            />

            <Textarea
              label="SEO Description"
              name="seo_description"
              value={formData.seo_description}
              onChange={handleChange}
              rows={3}
              placeholder="Quality auto spare parts for Japanese and Korean vehicles..."
              helperText="Brief description shown in search results (150-160 characters recommended)"
            />

            <Input
              label="SEO Keywords"
              name="seo_keywords"
              value={formData.seo_keywords}
              onChange={handleChange}
              placeholder="auto parts, spare parts, Japanese cars, Korean cars"
              helperText="Comma-separated keywords for search engines"
            />
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 sticky bottom-6 bg-white p-4 rounded-lg shadow-lg border border-metallic-200">
          <Button 
            type="button" 
            variant="outline" 
            onClick={loadSettings}
            disabled={isSaving}
          >
            Reset
          </Button>
          <Button type="submit" isLoading={isSaving} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>

      {/* Last Updated Info */}
      {settings?.updated_at && (
        <Card className="p-4">
          <p className="text-sm text-metallic-500 text-center">
            Last updated: {new Date(settings.updated_at).toLocaleString()}
          </p>
        </Card>
      )}
    </div>
  );
};
