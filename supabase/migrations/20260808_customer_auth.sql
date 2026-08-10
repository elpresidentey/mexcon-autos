-- Customer registration: email confirmation is enabled on this project, so
-- signUp() leaves auth.users unconfirmed with NO session. registerCustomer()
-- then fails RLS because auth.uid() is null. This SECURITY DEFINER function
-- creates the auth user (auto-confirmed, same pattern as the admin reset
-- script) and the customer row in one transaction.

CREATE OR REPLACE FUNCTION public.register_customer(
  p_email text,
  p_password text,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_phone text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := gen_random_uuid();
  v_clean_email text := lower(btrim(p_email));
BEGIN
  IF v_clean_email = '' OR p_password IS NULL OR length(p_password) < 6 THEN
    RAISE EXCEPTION 'invalid email or password (min 6 characters)';
  END IF;

  IF EXISTS (SELECT 1 FROM auth.users WHERE email = v_clean_email) THEN
    RAISE EXCEPTION 'an account already exists for this email';
  END IF;

  INSERT INTO auth.users (
    instance_id, id, aud, role,
    email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
    v_clean_email, extensions.crypt(p_password, extensions.gen_salt('bf')),
    now(), now(), now(),
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
    jsonb_build_object('first_name', COALESCE(p_first_name, ''), 'last_name', COALESCE(p_last_name, '')),
    '', '', '', ''
  );

  INSERT INTO public.customers (id, auth_id, email, first_name, last_name, phone, is_active)
  VALUES (v_uid, v_uid, v_clean_email, p_first_name, p_last_name, p_phone, true);

  RETURN v_uid;
END;
$$;

REVOKE ALL ON FUNCTION public.register_customer(text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_customer(text, text, text, text, text) TO anon, authenticated;

-- RLS policies for customer addresses (missing entirely -> checkout address save fails)
DROP POLICY IF EXISTS "Customers can manage own addresses" ON public.customer_addresses;
CREATE POLICY "Customers can manage own addresses" ON public.customer_addresses FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_addresses.customer_id AND c.auth_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_addresses.customer_id AND c.auth_id = auth.uid()
    )
  );