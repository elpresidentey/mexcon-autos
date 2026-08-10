-- Fix: enquiry_images policies were created FOR ROLE public (vintage Supabase)
-- but PostgREST runs as anon. Redeploy to anon/authenticated.

ALTER POLICY "Public can create enquiry images"
  ON public.enquiry_images
  TO anon, authenticated
  WITH CHECK (true);

ALTER POLICY "Admins can manage enquiry images"
  ON public.enquiry_images
  TO anon, authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());