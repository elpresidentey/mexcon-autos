-- Migration: Secure admin RLS with is_admin() helper
-- Safe to run against a live DB where some tables may not exist yet.
-- Each block only executes if its table exists.

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

DO $$
BEGIN
  IF to_regclass('public.categories') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage categories" ON categories';
    EXECUTE 'CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (public.is_admin())';
  END IF;

  IF to_regclass('public.brands') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage brands" ON brands';
    EXECUTE 'CREATE POLICY "Admins can manage brands" ON brands FOR ALL USING (public.is_admin())';
  END IF;

  IF to_regclass('public.products') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage products" ON products';
    EXECUTE 'CREATE POLICY "Admins can manage products" ON products FOR ALL USING (public.is_admin())';
  END IF;

  IF to_regclass('public.product_images') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage product images" ON product_images';
    EXECUTE 'CREATE POLICY "Admins can manage product images" ON product_images FOR ALL USING (public.is_admin())';
  END IF;

  IF to_regclass('public.enquiries') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage enquiries" ON enquiries';
    EXECUTE 'CREATE POLICY "Admins can manage enquiries" ON enquiries FOR ALL USING (public.is_admin())';
  END IF;

  IF to_regclass('public.enquiry_images') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage enquiry images" ON enquiry_images';
    EXECUTE 'CREATE POLICY "Admins can manage enquiry images" ON enquiry_images FOR ALL USING (public.is_admin())';
  END IF;

  IF to_regclass('public.admin_users') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users';
    EXECUTE 'CREATE POLICY "Admins can view admin users" ON admin_users FOR SELECT USING (public.is_admin())';
  END IF;

  IF to_regclass('public.audit_logs') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs';
    EXECUTE 'CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (public.is_admin())';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can create audit logs" ON audit_logs';
    EXECUTE 'CREATE POLICY "Admins can create audit logs" ON audit_logs FOR INSERT WITH CHECK (public.is_admin())';
  END IF;

  IF to_regclass('public.platform_settings') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage settings" ON platform_settings';
    EXECUTE 'CREATE POLICY "Admins can manage settings" ON platform_settings FOR ALL USING (public.is_admin())';
  END IF;

  IF to_regclass('public.homepage_banners') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage banners" ON homepage_banners';
    EXECUTE 'CREATE POLICY "Admins can manage banners" ON homepage_banners FOR ALL USING (public.is_admin())';
  END IF;

  IF to_regclass('public.orders') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view all orders" ON orders';
    EXECUTE 'CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (public.is_admin())';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can update all orders" ON orders';
    EXECUTE 'CREATE POLICY "Admins can update all orders" ON orders FOR UPDATE USING (public.is_admin())';
  END IF;

  IF to_regclass('public.order_items') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view all order items" ON order_items';
    EXECUTE 'CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT USING (public.is_admin())';
  END IF;
END $$;