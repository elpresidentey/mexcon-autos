// Export all types from a central location
export * from './database.types';

// UI Component Props Types
export interface ProductCardProps {
  product: import('./database.types').Product;
  onQuoteRequest?: (product: import('./database.types').Product) => void;
}

export interface CategoryCardProps {
  category: import('./database.types').Category;
}

export interface BrandCardProps {
  brand: import('./database.types').Brand;
}

// Additional application types

export interface SearchFilters {
  manufacturer?: string;
  category?: string;
  model?: string;
  year?: number;
  engineType?: string;
  searchTerm?: string;
}

export interface VehicleSearchState {
  manufacturer?: string;
  model?: string;
  year?: number;
  engineType?: string;
  category?: string;
}

export interface QuoteRequestForm {
  customerName: string;
  phone: string;
  email: string;
  manufacturer: string;
  model: string;
  year: number;
  requestedPart: string;
  oemNumber?: string;
  image?: File;
  notes?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Auth context types
export interface AuthContextType {
  user: import('./database.types').AdminUser | import('./database.types').Customer | null;
  userType: 'admin' | 'customer' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  customerLogin: (email: string, password: string) => Promise<void>;
  customerRegister: (email: string, password: string, firstName?: string, lastName?: string, phone?: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const isAdminUser = (
  user: import('./database.types').AdminUser | import('./database.types').Customer | null,
): user is import('./database.types').AdminUser => !!user && 'role' in user;

// Japanese manufacturers we stock
export const JAPANESE_MANUFACTURERS = [
  'Toyota',
  'Lexus',
  'Nissan',
  'Mitsubishi',
  'Acura',
] as const;

// South Korean manufacturers we stock
export const KOREAN_MANUFACTURERS = [
  'Hyundai',
  'Kia',
] as const;

export const ALL_MANUFACTURERS = [
  ...JAPANESE_MANUFACTURERS,
  ...KOREAN_MANUFACTURERS,
] as const;

export type Manufacturer = typeof ALL_MANUFACTURERS[number];

// Product categories
export const PRODUCT_CATEGORIES = [
  'Engine Components',
  'Brake System',
  'Suspension',
  'Steering',
  'Transmission',
  'Cooling System',
  'Electrical Components',
  'Fuel System',
  'Body Parts',
  'Lighting',
  'Filters',
  'Accessories',
  'Oils & Lubricants',
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];
