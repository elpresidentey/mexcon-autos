-- Mexcon Autos Platform Database Schema
-- PostgreSQL / Supabase
-- This schema matches the application service layer (see src/services/*.service.ts)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE admin_role AS ENUM ('super_admin', 'content_manager', 'enquiry_manager');
CREATE TYPE enquiry_status AS ENUM ('new', 'contacted', 'resolved');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('paystack', 'flutterwave', 'bank_transfer', 'pay_on_delivery');
CREATE TYPE address_type AS ENUM ('billing', 'shipping', 'both');

-- Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    image_path TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brands Table
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    country VARCHAR(100),
    website TEXT,
    logo_url TEXT,
    logo_path TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    description TEXT,
    oem_number VARCHAR(100),
    part_number VARCHAR(100),
    specifications TEXT,
    compatibility_notes TEXT,
    compatible_models TEXT[] DEFAULT '{}',
    engine_type VARCHAR(150),
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    primary_image_id UUID,
    primary_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Images Table
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    url TEXT NOT NULL,
    alt_text TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enquiries Table
CREATE TABLE enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    vehicle_details TEXT,
    message TEXT NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    status enquiry_status DEFAULT 'new',
    is_read BOOLEAN DEFAULT FALSE,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enquiry Images Table
CREATE TABLE enquiry_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enquiry_id UUID NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    url TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Users Table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role admin_role DEFAULT 'enquiry_manager',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    previous_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform Settings Table
CREATE TABLE platform_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL DEFAULT 'Mexcon Autos',
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    business_address TEXT,
    whatsapp_number VARCHAR(50),
    social_media_links JSONB DEFAULT '{}',
    business_hours TEXT,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Homepage Banners Table
CREATE TABLE homepage_banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    title VARCHAR(255),
    subtitle TEXT,
    cta_text VARCHAR(100),
    cta_link VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers Table (linked to Supabase Auth)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE, -- Links to Supabase Auth users.id
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Addresses Table
CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    address_type address_type DEFAULT 'both',
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Nigeria',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    payment_method payment_method,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    shipping_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    
    -- Shipping Address
    shipping_address_line1 VARCHAR(255),
    shipping_address_line2 VARCHAR(255),
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    shipping_country VARCHAR(100),
    shipping_phone VARCHAR(50),
    
    -- Billing Address
    billing_address_line1 VARCHAR(255),
    billing_address_line2 VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_postal_code VARCHAR(20),
    billing_country VARCHAR(100),
    
    -- Payment Details
    payment_reference VARCHAR(255),
    payment_gateway_response JSONB,
    
    -- Notes
    customer_notes TEXT,
    admin_notes TEXT,
    
    -- Tracking
    tracking_number VARCHAR(255),
    tracking_url TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart Table (for logged-in users)
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, product_id)
);

-- Create Indexes for Performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_enquiries_status ON enquiries(status);
CREATE INDEX idx_enquiries_created ON enquiries(created_at DESC);
CREATE INDEX idx_enquiry_images_enquiry ON enquiry_images(enquiry_id);
CREATE INDEX idx_audit_logs_admin ON audit_logs(admin_user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- E-commerce Indexes
CREATE INDEX idx_customers_auth ON customers(auth_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customer_addresses_customer ON customer_addresses(customer_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_cart_items_customer ON cart_items(customer_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);

-- Create Function to Update updated_at Timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create Triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON enquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON platform_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_addresses_updated_at BEFORE UPDATE ON customer_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Security helper: checks whether the current request's JWT email belongs to an
-- admin in the admin_users table. SECURITY DEFINER is required so the function
-- can read admin_users even though RLS is enabled on it.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = auth.jwt() ->> 'email'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiry_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Public read access for active categories
CREATE POLICY "Public can view active categories" ON categories
    FOR SELECT USING (is_active = TRUE);

-- Public read access for active brands
CREATE POLICY "Public can view active brands" ON brands
    FOR SELECT USING (is_active = TRUE);

-- Public read access for active products
CREATE POLICY "Public can view active products" ON products
    FOR SELECT USING (is_active = TRUE);

-- Public read access for product images
CREATE POLICY "Public can view product images" ON product_images
    FOR SELECT USING (true);

-- Admin full access to categories
CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (public.is_admin());

-- Admin full access to brands
CREATE POLICY "Admins can manage brands" ON brands
    FOR ALL USING (public.is_admin());

-- Admin full access to products
CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (public.is_admin());

-- Admin full access to product images
CREATE POLICY "Admins can manage product images" ON product_images
    FOR ALL USING (public.is_admin());

-- Public can insert enquiries
CREATE POLICY "Public can create enquiries" ON enquiries
    FOR INSERT WITH CHECK (true);

-- Admins can view and manage all enquiries
CREATE POLICY "Admins can manage enquiries" ON enquiries
    FOR ALL USING (public.is_admin());

-- Public can insert enquiry images
CREATE POLICY "Public can create enquiry images" ON enquiry_images
    FOR INSERT WITH CHECK (true);

-- Admins can view and manage enquiry images
CREATE POLICY "Admins can manage enquiry images" ON enquiry_images
    FOR ALL USING (public.is_admin());

-- Admins can view admin users
CREATE POLICY "Admins can view admin users" ON admin_users
    FOR SELECT USING (public.is_admin());

-- Admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (public.is_admin());

-- Admins can insert audit logs
CREATE POLICY "Admins can create audit logs" ON audit_logs
    FOR INSERT WITH CHECK (public.is_admin());

-- Public read access for platform settings
CREATE POLICY "Public can view settings" ON platform_settings
    FOR SELECT USING (true);

-- Admins can manage settings
CREATE POLICY "Admins can manage settings" ON platform_settings
    FOR ALL USING (public.is_admin());

-- Public read access for active banners
CREATE POLICY "Public can view active banners" ON homepage_banners
    FOR SELECT USING (active = TRUE);

-- Admins can manage banners
CREATE POLICY "Admins can manage banners" ON homepage_banners
    FOR ALL USING (public.is_admin());

-- E-commerce RLS Policies

-- Customers can view their own data
CREATE POLICY "Customers can view own data" ON customers
    FOR SELECT USING (auth.uid() = auth_id);

-- Customers can insert their own data
CREATE POLICY "Customers can insert own data" ON customers
    FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Customers can update their own data
CREATE POLICY "Customers can update own data" ON customers
    FOR UPDATE USING (auth.uid() = auth_id);

-- Customers can view their own addresses
CREATE POLICY "Customers can view own addresses" ON customer_addresses
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM customers WHERE auth_id = auth.uid()
        )
    );

-- Customers can insert their own addresses
CREATE POLICY "Customers can insert own addresses" ON customer_addresses
    FOR INSERT WITH CHECK (
        customer_id IN (
            SELECT id FROM customers WHERE auth_id = auth.uid()
        )
    );

-- Customers can update their own addresses
CREATE POLICY "Customers can update own addresses" ON customer_addresses
    FOR UPDATE USING (
        customer_id IN (
            SELECT id FROM customers WHERE auth_id = auth.uid()
        )
    );

-- Customers can delete their own addresses
CREATE POLICY "Customers can delete own addresses" ON customer_addresses
    FOR DELETE USING (
        customer_id IN (
            SELECT id FROM customers WHERE auth_id = auth.uid()
        )
    );

-- Customers can view their own orders
CREATE POLICY "Customers can view own orders" ON orders
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM customers WHERE auth_id = auth.uid()
        )
    );

-- Customers can insert their own orders
CREATE POLICY "Customers can insert own orders" ON orders
    FOR INSERT WITH CHECK (
        customer_id IN (
            SELECT id FROM customers WHERE auth_id = auth.uid()
        )
    );

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (public.is_admin());

-- Admins can update all orders
CREATE POLICY "Admins can update all orders" ON orders
    FOR UPDATE USING (public.is_admin());

-- Customers can view their own order items
CREATE POLICY "Customers can view own order items" ON order_items
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders WHERE customer_id IN (
                SELECT id FROM customers WHERE auth_id = auth.uid()
            )
        )
    );

-- Admins can view all order items
CREATE POLICY "Admins can view all order items" ON order_items
    FOR SELECT USING (public.is_admin());

-- Customers can view their own cart items
CREATE POLICY "Customers can view own cart items" ON cart_items
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM customers WHERE auth_id = auth.uid()
        )
    );

-- Customers can insert their own cart items
CREATE POLICY "Customers can insert own cart items" ON cart_items
    FOR INSERT WITH CHECK (
        customer_id IN (
            SELECT id FROM customers WHERE auth_id = auth.uid()
        )
    );

-- Customers can update their own cart items
CREATE POLICY "Customers can update own cart items" ON cart_items
    FOR UPDATE USING (
        customer_id IN (
            SELECT id FROM customers WHERE auth_id = auth.uid()
        )
    );

-- Customers can delete their own cart items
CREATE POLICY "Customers can delete own cart items" ON cart_items
    FOR DELETE USING (
        customer_id IN (
            SELECT id FROM customers WHERE auth_id = auth.uid()
        )
    );

-- Insert Default Data

-- Default Categories
INSERT INTO categories (name, slug, description, image_url) VALUES
    ('Engine Components', 'engine-components', 'Engine parts including pistons, valves, timing belts and gaskets', '/car-engine.webp'),
    ('Engine Parts', 'engine-parts', 'Complete engine components and assemblies', NULL),
    ('Brake System', 'brake-system', 'Brake pads, discs, calipers and master cylinders', '/brake-system.webp'),
    ('Brake & Wheel Hub/Bearings', 'brake-wheel-hub-bearings', 'Brake pads, wheel bearings, hubs and related components', NULL),
    ('Suspension', 'suspension', 'Shock absorbers, struts, control arms and bushings', NULL),
    ('Suspension Parts', 'suspension-parts', 'Complete suspension system components and assemblies', NULL),
    ('Steering', 'steering', 'Rack and pinion, tie rods, and steering columns', NULL),
    ('Steering Parts', 'steering-parts', 'Power steering pumps, racks, and steering components', NULL),
    ('Transmission', 'transmission', 'Gearboxes, clutches, torque converters and transmission fluid', NULL),
    ('Drivetrain', 'drivetrain', 'Drive shafts, differentials, axles and CV joints', NULL),
    ('Cooling System', 'cooling-system', 'Radiators, water pumps, thermostats and coolant', NULL),
    ('Cooling & Heating System', 'cooling-heating-system', 'Complete cooling and HVAC system components', NULL),
    ('Electrical Components', 'electrical-components', 'Alternators, starters, sensors and wiring', NULL),
    ('Electrical', 'electrical', 'Complete electrical system components', NULL),
    ('Fuel System', 'fuel-system', 'Fuel pumps, injectors, filters and throttle bodies', NULL),
    ('Fuel System & Fuel Injection', 'fuel-system-fuel-injection', 'Fuel pumps, injectors, and fuel delivery systems', NULL),
    ('Body Parts', 'body-parts', 'Bumpers, fenders, hoods, mirrors and trim', NULL),
    ('Body & Light Parts', 'body-light-parts', 'Body panels and lighting components', NULL),
    ('Lighting', 'lighting', 'Headlights, tail lights, indicators and bulbs', NULL),
    ('Exhaust & Emission', 'exhaust-emission', 'Exhaust systems, mufflers, catalytic converters and emission controls', NULL),
    ('Air Intake', 'air-intake', 'Air filters, intake manifolds and throttle bodies', NULL),
    ('Filters', 'filters', 'Oil, air, fuel and cabin filters', NULL),
    ('Air Filters', 'air-filters', 'Engine air filters and intake components', NULL),
    ('Oil Filter', 'oil-filter', 'Engine oil filters and related components', NULL),
    ('Spark Plugs', 'spark-plugs', 'Spark plugs, ignition coils and ignition components', NULL),
    ('Accessories', 'accessories', 'Floor mats, wiper blades, badges and convenience items', NULL),
    ('Tools, Gadget & Safety products', 'tools-gadget-safety-products', 'Automotive tools, gadgets and safety equipment', NULL),
    ('Tyres', 'tyres', 'Car tires and wheel components', NULL),
    ('Oils & Lubricants', 'oils-lubricants', 'Engine oil, transmission fluid, brake fluid and greases', NULL),
    ('Lubricants/Fluids', 'lubricants-fluids', 'Engine oil, transmission fluid, brake fluid and coolants', NULL),
    ('Engine Oil', 'engine-oil', 'Engine oils and lubricants', NULL),
    ('Transmission Fluid', 'transmission-fluid', 'Transmission fluids and gear oils', NULL),
    ('Coolants & Appearance Products', 'coolants-appearance-products', 'Coolants, antifreeze and car care products', NULL),
    ('Batteries', 'batteries', 'Car batteries and electrical charging systems', NULL),
    ('Servicing Parts', 'servicing-parts', 'General maintenance and service parts', NULL),
    ('Car Care & Tools', 'car-care-tools', 'Car care products and automotive tools', NULL);

-- Default Brands (Japanese)
INSERT INTO brands (name, slug, country, description) VALUES
    ('Toyota', 'toyota', 'Japan', 'Leading Japanese manufacturer known for reliability'),
    ('Lexus', 'lexus', 'Japan', 'Toyota luxury vehicle division'),
    ('Honda', 'honda', 'Japan', 'Japanese manufacturer of automobiles and engines'),
    ('Acura', 'acura', 'Japan', 'Honda luxury vehicle division'),
    ('Nissan', 'nissan', 'Japan', 'Major Japanese automobile manufacturer'),
    ('Infiniti', 'infiniti', 'Japan', 'Nissan luxury vehicle division'),
    ('Mazda', 'mazda', 'Japan', 'Japanese automaker known for the rotary engine'),
    ('Mitsubishi', 'mitsubishi', 'Japan', 'Japanese multinational automotive manufacturer'),
    ('Subaru', 'subaru', 'Japan', 'Japanese automaker known for all-wheel drive'),
    ('Suzuki', 'suzuki', 'Japan', 'Japanese manufacturer also known for motorcycles'),
    ('Isuzu', 'isuzu', 'Japan', 'Japanese commercial vehicle and diesel engine maker'),
    ('Daihatsu', 'daihatsu', 'Japan', 'Japanese manufacturer known for compact cars');

-- Default Brands (South Korean)
INSERT INTO brands (name, slug, country, description) VALUES
    ('Hyundai', 'hyundai', 'South Korea', 'Major South Korean automotive manufacturer'),
    ('Kia', 'kia', 'South Korea', 'South Korean multinational automotive manufacturer'),
    ('Genesis', 'genesis', 'South Korea', 'Hyundai luxury vehicle division'),
    ('KG Mobility (SsangYong)', 'kg-mobility', 'South Korea', 'South Korean SUV and pickup specialist');

-- Default Platform Settings
INSERT INTO platform_settings (
    id,
    company_name,
    contact_email,
    social_media_links
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Mexcon Autos',
    'info@mexconautos.com',
    '{}'::jsonb
);

-- Create Default Admin User for Supabase Auth
-- 1. Create the user in Supabase Auth (Dashboard > Authentication > Users > Add user)
--    email: admin@mexconautos.com   password: (choose a strong one)
-- 2. Then insert the matching row here so the app can find the admin:
INSERT INTO admin_users (id, name, email, role) VALUES
    (uuid_generate_v4(), 'Super Admin', 'admin@mexconautos.com', 'super_admin');

-- IMPORTANT: Replace 'admin@mexconautos.com' with the actual email of the
-- Supabase Auth user you create. The auth.user email and admin_users.email MUST match.

-- Sample Products
-- Run the separate file: supabase-seed-products.sql
-- This file contains 24 sample products for the shop