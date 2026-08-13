// Database entity types for Mexcon Autos Platform

export type ProductStockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order';
export type ProductCondition = 'genuine' | 'oem_equivalent' | 'aftermarket' | 'rebuilt' | 'used';

export interface Product {
  id: string;
  name: string;
  category_id: string;
  brand_id: string;
  price: number;
  description?: string;
  oem_number?: string;
  part_number?: string;
  specifications?: string;
  compatibility_notes?: string;
  compatible_models: string[];
  engine_type?: string;
  stock_status?: ProductStockStatus;
  condition_label?: ProductCondition;
  warranty_months?: number;
  is_featured: boolean;
  is_active: boolean;
  view_count: number;
  primary_image_id?: string | null;
  primary_image_url?: string | null;
  created_at: string;
  updated_at?: string;
  category?: Category | null;
  brand?: Brand | null;
  images?: ProductImage[];
}

export interface ProductFormData {
  name: string;
  category_id: string;
  brand_id: string;
  price: number;
  description?: string;
  oem_number?: string;
  part_number?: string;
  specifications?: string;
  compatibility_notes?: string;
  compatible_models?: string[];
  engine_type?: string;
  stock_status?: ProductStockStatus;
  condition_label?: ProductCondition;
  warranty_months?: number;
  is_featured?: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  path: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  order_index: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string | null;
  image_path?: string | null;
  is_active: boolean;
  order_index: number;
  product_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  country?: string;
  website?: string;
  logo_path?: string | null;
  logo_url?: string | null;
  is_featured: boolean;
  is_active: boolean;
  order_index: number;
  product_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface BrandFormData {
  name: string;
  slug: string;
  description?: string;
  country?: string;
  website?: string;
  is_featured?: boolean;
}

export const EnquiryStatus = {
  NEW: 'new',
  CONTACTED: 'contacted',
  RESOLVED: 'resolved',
} as const;

export type EnquiryStatus = typeof EnquiryStatus[keyof typeof EnquiryStatus];

export interface Enquiry {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  vehicle_details?: string;
  message: string;
  product_id?: string | null;
  status: EnquiryStatus;
  is_read: boolean;
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
  product?: Product | null;
  images?: EnquiryImage[];
}

export interface EnquiryImage {
  id: string;
  enquiry_id: string;
  path: string;
  url: string;
  order_index: number;
  created_at: string;
}

export interface EnquiryFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  vehicle_details: string;
  message: string;
  product_id?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  created_at: string;
  last_login?: string;
}

export const AdminRole = {
  SUPER_ADMIN: 'super_admin',
  CONTENT_MANAGER: 'content_manager',
  ENQUIRY_MANAGER: 'enquiry_manager',
} as const;

export type AdminRole = typeof AdminRole[keyof typeof AdminRole];

export interface AuditLog {
  id: string;
  admin_user_id: string;
  action_type: string;
  entity_type: string;
  entity_id?: string;
  previous_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface PlatformSettings {
  id: string;
  company_name: string;
  contact_phone: string;
  contact_email: string;
  business_address: string;
  whatsapp_number: string;
  social_media_links: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  business_hours?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  updated_at: string;
}

export interface HomepageBanner {
  id: string;
  image_url: string;
  title?: string;
  subtitle?: string;
  cta_text?: string;
  cta_link?: string;
  display_order: number;
  active: boolean;
  created_at: string;
}

// E-commerce types
export interface Customer {
  id: string;
  auth_id?: string | null;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CustomerFormData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  address_type: 'billing' | 'shipping' | 'both';
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code?: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CustomerAddressFormData {
  address_type: 'billing' | 'shipping' | 'both';
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code?: string;
  country?: string;
  is_default?: boolean;
}

export const OrderStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export const PaymentStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export const PaymentMethod = {
  PAYSTACK: 'paystack',
  FLUTTERWAVE: 'flutterwave',
  BANK_TRANSFER: 'bank_transfer',
  PAY_ON_DELIVERY: 'pay_on_delivery',
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string | null;
  customer_name?: string;
  customer_email?: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  shipping_address_line1?: string;
  shipping_address_line2?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  shipping_phone?: string;
  billing_address_line1?: string;
  billing_address_line2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_postal_code?: string;
  billing_country?: string;
  payment_reference?: string;
  payment_gateway_response?: Record<string, any>;
  customer_notes?: string;
  admin_notes?: string;
  tracking_number?: string;
  tracking_url?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at?: string;
  customer?: Customer | null;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface CartItem {
  id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at?: string;
  product?: Product;
}

export interface CartItemFormData {
  product_id: string;
  quantity: number;
}
