-- Migration: Secure enquiry submission RPC for customer quote form.
-- Plain INSERT works with return=minimal, but the app calls
-- .insert().select().single() -> PostgREST return=representation, which
-- evaluates SELECT policies on the returned rows. anon has no SELECT on
-- enquiries (by design), so submissions route through a SECURITY DEFINER
-- function that inserts and returns the row.

CREATE OR REPLACE FUNCTION public.submit_enquiry(
  customer_name text,
  customer_email text,
  customer_phone text DEFAULT NULL,
  vehicle_details text DEFAULT NULL,
  message text DEFAULT NULL,
  product_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row jsonb;
BEGIN
  IF message IS NULL OR btrim(message) = '' THEN
    RAISE EXCEPTION 'message is required';
  END IF;

  INSERT INTO enquiries (customer_name, customer_email, customer_phone, vehicle_details, message, product_id)
  VALUES (customer_name, customer_email, customer_phone, vehicle_details, message, product_id)
  RETURNING to_jsonb(enquiries.*) INTO _row;

  RETURN _row;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_enquiry(text, text, text, text, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_enquiry(text, text, text, text, text, uuid) TO anon, authenticated;