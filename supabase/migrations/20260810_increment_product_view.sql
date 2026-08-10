-- Backfill the RPC the app calls when a product detail page is viewed.
DROP FUNCTION IF EXISTS public.increment_product_view(uuid);

CREATE OR REPLACE FUNCTION public.increment_product_view(product_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  UPDATE products SET view_count = view_count + 1 WHERE id = product_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_product_view(uuid) TO anon, authenticated, service_role;