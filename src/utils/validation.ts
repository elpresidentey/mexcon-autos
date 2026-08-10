// Input validation utilities

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Allow digits, spaces, hyphens, and plus signs
  const phoneRegex = /^[\d\s\-+()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const validateYear = (year: number): boolean => {
  const currentYear = new Date().getFullYear();
  return year >= 1990 && year <= currentYear + 1;
};

export const validateOemNumber = (oemNumber: string): boolean => {
  // Allow alphanumeric characters and hyphens
  const oemRegex = /^[a-zA-Z0-9\-]+$/;
  return oemRegex.test(oemNumber);
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 5MB limit.',
    };
  }

  return { valid: true };
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const sanitizeInput = (input: string): string => {
  // Remove HTML tags and trim whitespace
  return input.replace(/<[^>]*>/g, '').trim();
};

export const validateRequired = (value: any, fieldName: string): string | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName: string
): string | null => {
  if (value && value.length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters`;
  }
  return null;
};

export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string
): string | null => {
  if (value && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

// Product validation
export const validateProductForm = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields
  if (!data.name || data.name.trim() === '') {
    errors.push('Product name is required');
  } else if (data.name.length > 200) {
    errors.push('Product name must not exceed 200 characters');
  }

  if (!data.category_id) {
    errors.push('Category is required');
  }

  if (!data.brand_id) {
    errors.push('Brand is required');
  }

  if (!data.price || isNaN(Number(data.price)) || Number(data.price) <= 0) {
    errors.push('Valid price is required');
  }

  if (data.oem_number && !validateOemNumber(data.oem_number)) {
    errors.push('Invalid OEM number format');
  }

  if (data.part_number && data.part_number.length > 50) {
    errors.push('Part number must not exceed 50 characters');
  }

  if (data.description && data.description.length > 2000) {
    errors.push('Description must not exceed 2000 characters');
  }

  if (data.specifications && data.specifications.length > 5000) {
    errors.push('Specifications must not exceed 5000 characters');
  }

  if (data.compatibility_notes && data.compatibility_notes.length > 1000) {
    errors.push('Compatibility notes must not exceed 1000 characters');
  }

  if (data.engine_type && data.engine_type.length > 150) {
    errors.push('Engine type must not exceed 150 characters');
  }

  if (Array.isArray(data.compatible_models)) {
    const cleaned = data.compatible_models.filter((m: any) => typeof m === 'string' && m.trim() !== '');
    if (cleaned.length > 20) {
      errors.push('A maximum of 20 compatible models are allowed');
    }
    if (cleaned.some((m: any) => m.length > 100)) {
      errors.push('Compatible model entries must not exceed 100 characters');
    }
  }

  // Validate numeric fields
  if (data.stock_quantity && (isNaN(Number(data.stock_quantity)) || Number(data.stock_quantity) < 0)) {
    errors.push('Stock quantity must be a non-negative number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Category validation
export const validateCategoryForm = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields
  if (!data.name || data.name.trim() === '') {
    errors.push('Category name is required');
  } else if (data.name.length > 100) {
    errors.push('Category name must not exceed 100 characters');
  }

  if (!data.slug || data.slug.trim() === '') {
    errors.push('Slug is required');
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
  }

  if (data.description && data.description.length > 500) {
    errors.push('Description must not exceed 500 characters');
  }

  if (data.meta_title && data.meta_title.length > 60) {
    errors.push('Meta title must not exceed 60 characters');
  }

  if (data.meta_description && data.meta_description.length > 160) {
    errors.push('Meta description must not exceed 160 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Brand validation
export const validateBrandForm = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields
  if (!data.name || data.name.trim() === '') {
    errors.push('Brand name is required');
  } else if (data.name.length > 100) {
    errors.push('Brand name must not exceed 100 characters');
  }

  if (!data.slug || data.slug.trim() === '') {
    errors.push('Slug is required');
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
  }

  if (data.description && data.description.length > 500) {
    errors.push('Description must not exceed 500 characters');
  }

  if (data.country && data.country.length > 50) {
    errors.push('Country must not exceed 50 characters');
  }

  if (data.website && !/^https?:\/\/.+\..+/.test(data.website)) {
    errors.push('Invalid website URL format');
  }

  if (data.meta_title && data.meta_title.length > 60) {
    errors.push('Meta title must not exceed 60 characters');
  }

  if (data.meta_description && data.meta_description.length > 160) {
    errors.push('Meta description must not exceed 160 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Enquiry validation
export const validateEnquiryForm = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields
  if (!data.customer_name || data.customer_name.trim() === '') {
    errors.push('Customer name is required');
  } else if (data.customer_name.length > 100) {
    errors.push('Customer name must not exceed 100 characters');
  }

  if (!data.customer_email || data.customer_email.trim() === '') {
    errors.push('Email is required');
  } else if (!validateEmail(data.customer_email)) {
    errors.push('Invalid email address');
  }

  if (data.customer_phone && !validatePhone(data.customer_phone)) {
    errors.push('Invalid phone number format');
  }

  if (!data.message || data.message.trim() === '') {
    errors.push('Message is required');
  } else if (data.message.length > 2000) {
    errors.push('Message must not exceed 2000 characters');
  }

  if (data.vehicle_details && data.vehicle_details.length > 500) {
    errors.push('Vehicle details must not exceed 500 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};