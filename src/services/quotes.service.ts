import { enquiriesService } from './enquiries.service';
import { getWhatsAppNumber } from '../components/customer/WhatsAppButton';
import { generateWhatsAppLink } from '../utils/helpers';
import { validateRequired, validateEmail, validatePhone, validateMaxLength, validateImageFile } from '../utils/validation';
import type { Enquiry } from '../types';

export interface QuoteRequestData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleDetails?: string;
  message: string;
  productId?: string;
}

export interface QuoteValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Quote Request Service
 * Handles customer quote submissions with validation, image upload and WhatsApp follow-up (Req 5)
 */
export class QuotesService {
  /**
   * Validate quote request form fields
   */
  validateQuoteForm(data: QuoteRequestData): QuoteValidationResult {
    const errors: Record<string, string> = {};

    const nameError = validateRequired(data.customerName, 'Full name');
    if (nameError) errors.customerName = nameError;
    else {
      const lengthError = validateMaxLength(data.customerName, 100, 'Full name');
      if (lengthError) errors.customerName = lengthError;
    }

    const emailError = validateRequired(data.customerEmail, 'Email address');
    if (emailError) errors.customerEmail = emailError;
    else if (!validateEmail(data.customerEmail)) {
      errors.customerEmail = 'Please enter a valid email address';
    }

    const phoneError = validateRequired(data.customerPhone, 'Phone number');
    if (phoneError) errors.customerPhone = phoneError;
    else if (!validatePhone(data.customerPhone)) {
      errors.customerPhone = 'Please enter a valid phone number';
    }

    const messageError = validateRequired(data.message, 'Part details');
    if (messageError) errors.message = messageError;
    else {
      const lengthError = validateMaxLength(data.message, 2000, 'Part details');
      if (lengthError) errors.message = lengthError;
    }

    if (data.vehicleDetails) {
      const lengthError = validateMaxLength(data.vehicleDetails, 500, 'Vehicle details');
      if (lengthError) errors.vehicleDetails = lengthError;
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validate image files before upload (max 5 images, 5MB each)
   */
  validateImages(files: File[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (files.length > 5) {
      errors.push('Maximum 5 images allowed');
    }

    for (const file of files) {
      const result = validateImageFile(file);
      if (!result.valid) {
        errors.push(`${file.name}: ${result.error}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Submit a quote request
   */
  async submitQuote(data: QuoteRequestData, images: File[] = []): Promise<Enquiry> {
    // Validate form
    const formValidation = this.validateQuoteForm(data);
    if (!formValidation.valid) {
      const messages = Object.values(formValidation.errors);
      throw new Error(messages.join('. '));
    }

    // Validate images
    if (images.length > 0) {
      const imageValidation = this.validateImages(images);
      if (!imageValidation.valid) {
        throw new Error(imageValidation.errors.join('. '));
      }
    }

    return enquiriesService.submitEnquiry(
      {
        customer_name: data.customerName.trim(),
        customer_email: data.customerEmail.trim(),
        customer_phone: data.customerPhone.trim(),
        vehicle_details: data.vehicleDetails?.trim() || '',
        message: data.message.trim(),
        product_id: data.productId,
      },
      images
    );
  }

  /**
   * Generate a WhatsApp follow-up link so the customer can continue the conversation
   */
  async getWhatsAppFollowUpLink(enquiry: Enquiry): Promise<string> {
    const number = await getWhatsAppNumber();
    const message = `Hello, I just submitted a quote request on your website.\n\nName: ${enquiry.customer_name}\nRef: ${enquiry.id}\n\nI look forward to hearing from you.`;
    return generateWhatsAppLink(number, message);
  }
}

// Export singleton instance
export const quotesService = new QuotesService();
