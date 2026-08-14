-- Migration: Allow admins to upload/manage media in all admin storage buckets
-- (categories, brands, banners, products) via is_admin() RLS check.
-- Previously only the products bucket was covered, so category/brand/banner
-- image uploads silently failed (uploadImage returned null and the row saved
-- without an image).

DROP POLICY IF EXISTS "Admins can manage product media" ON storage.objects;

CREATE POLICY "Admins can manage media" ON storage.objects
  FOR ALL
  TO public
  USING (
    bucket_id IN ('categories', 'brands', 'banners', 'products')
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id IN ('categories', 'brands', 'banners', 'products')
    AND public.is_admin()
  );
