-- Migration: Add missing e-commerce tables (customers, addresses, orders, order_items, cart_items)
-- Safe to re-run. Creates enums only if missing, tables/indexes with IF NOT EXISTS,
-- and drops/recreates triggers and RLS policies.

-- 1. ENUM types (created only if missing)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE payment_method AS ENUM ('paystack', 'flutterwave', 'bank_transfer', 'pay_on_delivery');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'address_type') THEN
    CREATE TYPE address_type AS ENUM ('billing', 'shipping', 'both');
  END IF;
END $$;

-- 2. Tables
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_addresses (
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

CREATE TABLE IF NOT EXISTS orders (
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
    shipping_address_line1 VARCHAR(255),
    shipping_address_line2 VARCHAR(255),
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    shipping_country VARCHAR(100),
    shipping_phone VARCHAR(50),
    billing_address_line1 VARCHAR(255),
    billing_address_line2 VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_postal_code VARCHAR(20),
    billing_country VARCHAR(100),
    payment_reference VARCHAR(255),
    payment_gateway_response JSONB,
    customer_notes TEXT,
    admin_notes TEXT,
    tracking_number VARCHAR(255),
    tracking_url TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
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

CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, product_id)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_customers_auth ON customers(auth_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_customer ON cart_items(customer_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);

-- 4. updated_at triggers (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customer_addresses_updated_at ON customer_addresses;
CREATE TRIGGER update_customer_addresses_updated_at BEFORE UPDATE ON customer_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Customers
DROP POLICY IF EXISTS "Customers can view own data" ON customers;
CREATE POLICY "Customers can view own data" ON customers
    FOR SELECT USING (auth.uid() = auth_id);

DROP POLICY IF EXISTS "Customers can insert own data" ON customers;
CREATE POLICY "Customers can insert own data" ON customers
    FOR INSERT WITH CHECK (auth.uid() = auth_id);

DROP POLICY IF EXISTS "Customers can update own data" ON customers;
CREATE POLICY "Customers can update own data" ON customers
    FOR UPDATE USING (auth.uid() = auth_id);

-- Customer addresses
DROP POLICY IF EXISTS "Customers can view own addresses" ON customer_addresses;
CREATE POLICY "Customers can view own addresses" ON customer_addresses
    FOR SELECT USING (
        customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid())
    );

DROP POLICY IF EXISTS "Customers can insert own addresses" ON customer_addresses;
CREATE POLICY "Customers can insert own addresses" ON customer_addresses
    FOR INSERT WITH CHECK (
        customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid())
    );

DROP POLICY IF EXISTS "Customers can update own addresses" ON customer_addresses;
CREATE POLICY "Customers can update own addresses" ON customer_addresses
    FOR UPDATE USING (
        customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid())
    );

DROP POLICY IF EXISTS "Customers can delete own addresses" ON customer_addresses;
CREATE POLICY "Customers can delete own addresses" ON customer_addresses
    FOR DELETE USING (
        customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid())
    );

-- Orders
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
CREATE POLICY "Customers can view own orders" ON orders
    FOR SELECT USING (
        customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid())
    );

DROP POLICY IF EXISTS "Customers can insert own orders" ON orders;
CREATE POLICY "Customers can insert own orders" ON orders
    FOR INSERT WITH CHECK (
        customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid())
    );

DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
CREATE POLICY "Admins can update all orders" ON orders
    FOR UPDATE USING (public.is_admin());

-- Order items
DROP POLICY IF EXISTS "Customers can view own order items" ON order_items;
CREATE POLICY "Customers can view own order items" ON order_items
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders WHERE customer_id IN (
                SELECT id FROM customers WHERE auth_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
CREATE POLICY "Admins can view all order items" ON order_items
    FOR SELECT USING (public.is_admin());

-- Cart items
DROP POLICY IF EXISTS "Customers can view own cart items" ON cart_items;
CREATE POLICY "Customers can view own cart items" ON cart_items
    FOR SELECT USING (
        customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid())
    );

DROP POLICY IF EXISTS "Customers can insert own cart items" ON cart_items;
CREATE POLICY "Customers can insert own cart items" ON cart_items
    FOR INSERT WITH CHECK (
        customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid())
    );

DROP POLICY IF EXISTS "Customers can update own cart items" ON cart_items;
CREATE POLICY "Customers can update own cart items" ON cart_items
    FOR UPDATE USING (
        customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid())
    );

DROP POLICY IF EXISTS "Customers can delete own cart items" ON cart_items;
CREATE POLICY "Customers can delete own cart items" ON cart_items
    FOR DELETE USING (
        customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid())
    );