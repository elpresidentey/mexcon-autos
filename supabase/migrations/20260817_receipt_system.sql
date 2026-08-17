-- Receipt system: payment proof uploads + admin verification workflow.
--
-- 1. orders gains receipt + payment verification columns
-- 2. storage bucket "receipts" (public read via CDN, uploads allowed for
--    anon/authenticated like enquiry images, admins manage all)
-- 3. place_guest_order accepts the receipt path/url
-- 4. track_order / track_order_by_product return receipt + verification info
-- 5. "payment confirmed" email when payment_status moves to 'paid'

-- 1. Order columns ----------------------------------------------------------
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS receipt_path TEXT,
  ADD COLUMN IF NOT EXISTS receipt_url TEXT,
  ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_verified_by TEXT,
  ADD COLUMN IF NOT EXISTS payment_note TEXT;

-- 2. Receipts storage bucket + policies -------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('receipts', 'receipts', true, 5242880, ARRAY['image/png','image/jpeg','image/webp','application/pdf'])
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Anyone can upload receipts') THEN
    CREATE POLICY "Anyone can upload receipts" ON storage.objects
      FOR INSERT TO anon, authenticated
      WITH CHECK (bucket_id = 'receipts');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can manage receipts') THEN
    CREATE POLICY "Admins can manage receipts" ON storage.objects
      FOR ALL TO public
      USING (bucket_id = 'receipts' AND public.is_admin())
      WITH CHECK (bucket_id = 'receipts' AND public.is_admin());
  END IF;
END;
$$;

-- 3. Guest order placement accepts receipts ----------------------------------
CREATE OR REPLACE FUNCTION public.place_guest_order(
  p_items jsonb,
  p_payment_method text,
  p_subtotal numeric,
  p_shipping_cost numeric,
  p_tax_amount numeric,
  p_discount_amount numeric,
  p_total_amount numeric,
  p_shipping_address_line1 text,
  p_shipping_address_line2 text,
  p_shipping_city text,
  p_shipping_state text,
  p_shipping_postal_code text,
  p_shipping_country text,
  p_shipping_phone text,
  p_customer_name text,
  p_customer_email text,
  p_customer_notes text,
  p_receipt_path text DEFAULT NULL,
  p_receipt_url text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_order_number text;
  v_item jsonb;
BEGIN
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Cart has no items';
  END IF;

  v_order_number := 'MXN-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 12));

  INSERT INTO orders (
    order_number, status, payment_status, payment_method,
    subtotal, shipping_cost, tax_amount, discount_amount, total_amount,
    shipping_address_line1, shipping_address_line2, shipping_city, shipping_state,
    shipping_postal_code, shipping_country, shipping_phone,
    customer_name, customer_email, customer_notes,
    receipt_path, receipt_url
  ) VALUES (
    v_order_number, 'pending', 'pending', p_payment_method::public.payment_method,
    p_subtotal, p_shipping_cost, p_tax_amount, p_discount_amount, p_total_amount,
    p_shipping_address_line1, p_shipping_address_line2, p_shipping_city, p_shipping_state,
    p_shipping_postal_code, p_shipping_country, p_shipping_phone,
    p_customer_name, p_customer_email, p_customer_notes,
    p_receipt_path, p_receipt_url
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    INSERT INTO order_items (
      order_id, product_id, product_name, product_sku,
      quantity, unit_price, total_price
    ) VALUES (
      v_order_id,
      (v_item ->> 'product_id')::uuid,
      v_item ->> 'product_name',
      v_item ->> 'product_sku',
      (v_item ->> 'quantity')::integer,
      (v_item ->> 'unit_price')::numeric,
      (v_item ->> 'total_price')::numeric
    );
  END LOOP;

  RETURN jsonb_build_object('id', v_order_id, 'order_number', v_order_number);
END;
$$;

REVOKE ALL ON FUNCTION public.place_guest_order(jsonb, text, numeric, numeric, numeric, numeric, numeric, text, text, text, text, text, text, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_guest_order(jsonb, text, numeric, numeric, numeric, numeric, numeric, text, text, text, text, text, text, text, text, text, text, text, text) TO anon, authenticated;

-- 4. Tracking returns receipt + verification info -----------------------------
CREATE OR REPLACE FUNCTION public.track_order(
  p_order_number text,
  p_email text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_items jsonb;
BEGIN
  SELECT * INTO v_order FROM orders
  WHERE order_number = p_order_number
    AND (
      customer_email ILIKE p_email
      OR customer_id IN (SELECT c.id FROM customers c WHERE c.email ILIKE p_email)
    )
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'id', oi.id,
    'product_name', oi.product_name,
    'quantity', oi.quantity,
    'unit_price', oi.unit_price,
    'total_price', oi.total_price
  )), '[]'::jsonb) INTO v_items
  FROM order_items oi WHERE oi.order_id = v_order.id;

  RETURN jsonb_build_object(
    'id', v_order.id,
    'order_number', v_order.order_number,
    'status', v_order.status,
    'payment_status', v_order.payment_status,
    'payment_method', v_order.payment_method,
    'subtotal', v_order.subtotal,
    'shipping_cost', v_order.shipping_cost,
    'tax_amount', v_order.tax_amount,
    'total_amount', v_order.total_amount,
    'created_at', v_order.created_at,
    'shipping_address_line1', v_order.shipping_address_line1,
    'shipping_address_line2', v_order.shipping_address_line2,
    'shipping_city', v_order.shipping_city,
    'shipping_state', v_order.shipping_state,
    'shipping_postal_code', v_order.shipping_postal_code,
    'shipping_country', v_order.shipping_country,
    'shipping_phone', v_order.shipping_phone,
    'payment_reference', v_order.payment_reference,
    'tracking_number', v_order.tracking_number,
    'tracking_url', v_order.tracking_url,
    'customer_notes', v_order.customer_notes,
    'receipt_url', v_order.receipt_url,
    'payment_verified_at', v_order.payment_verified_at,
    'payment_note', v_order.payment_note,
    'items', v_items
  );
END;
$$;

REVOKE ALL ON FUNCTION public.track_order(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_order(text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.track_order_by_product(
  p_product_number text,
  p_email text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match text;
  v_orders jsonb := '[]'::jsonb;
  v_order RECORD;
  v_items jsonb;
BEGIN
  v_match := trim(p_product_number);

  IF v_match = '' THEN
    RETURN NULL;
  END IF;

  FOR v_order IN
    SELECT DISTINCT o.id, o.order_number, o.status, o.payment_status, o.payment_method,
           o.subtotal, o.shipping_cost, o.tax_amount, o.discount_amount, o.total_amount,
           o.created_at, o.shipping_address_line1, o.shipping_address_line2, o.shipping_city,
           o.shipping_state, o.shipping_postal_code, o.shipping_country, o.shipping_phone,
           o.payment_reference, o.tracking_number, o.tracking_url, o.customer_notes,
           o.receipt_url, o.payment_verified_at, o.payment_note
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE (
            oi.product_sku ILIKE '%' || v_match || '%'
            OR p.part_number ILIKE '%' || v_match || '%'
            OR p.oem_number ILIKE '%' || v_match || '%'
          )
        AND (
            o.customer_email ILIKE p_email
            OR o.customer_id IN (SELECT c.id FROM customers c WHERE c.email ILIKE p_email)
          )
  LOOP
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'id', oi.id,
      'product_name', oi.product_name,
      'quantity', oi.quantity,
      'unit_price', oi.unit_price,
      'total_price', oi.total_price
    )), '[]'::jsonb) INTO v_items
    FROM order_items oi WHERE oi.order_id = v_order.id;

    v_orders := v_orders || jsonb_build_object(
      'id', v_order.id,
      'order_number', v_order.order_number,
      'status', v_order.status,
      'payment_status', v_order.payment_status,
      'payment_method', v_order.payment_method,
      'subtotal', v_order.subtotal,
      'shipping_cost', v_order.shipping_cost,
      'tax_amount', v_order.tax_amount,
      'total_amount', v_order.total_amount,
      'created_at', v_order.created_at,
      'shipping_address_line1', v_order.shipping_address_line1,
      'shipping_address_line2', v_order.shipping_address_line2,
      'shipping_city', v_order.shipping_city,
      'shipping_state', v_order.shipping_state,
      'shipping_postal_code', v_order.shipping_postal_code,
      'shipping_country', v_order.shipping_country,
      'shipping_phone', v_order.shipping_phone,
      'payment_reference', v_order.payment_reference,
      'tracking_number', v_order.tracking_number,
      'tracking_url', v_order.tracking_url,
      'customer_notes', v_order.customer_notes,
      'receipt_url', v_order.receipt_url,
      'payment_verified_at', v_order.payment_verified_at,
      'payment_note', v_order.payment_note,
      'items', v_items
    );
  END LOOP;

  IF jsonb_array_length(v_orders) = 0 THEN
    RETURN NULL;
  END IF;

  RETURN v_orders;
END;
$$;

REVOKE ALL ON FUNCTION public.track_order_by_product(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_order_by_product(text, text) TO anon, authenticated;

-- 5. Payment-confirmed email --------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_payment_verified()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_api_key text;
  v_from text;
  v_base_url text;
  v_track_url text;
  v_subject text;
  v_html text;
  v_job bigint;
BEGIN
  IF NEW.customer_email IS NULL OR btrim(NEW.customer_email) = '' THEN
    RETURN NEW;
  END IF;

  SELECT value INTO v_api_key FROM app_secrets WHERE key = 'resend_api_key';
  IF v_api_key IS NULL THEN
    INSERT INTO email_logs (order_id, email_type, status) VALUES (NEW.id, 'payment_confirmed', 'error:resend_api_key not configured');
    RETURN NEW;
  END IF;

  SELECT value INTO v_from FROM app_secrets WHERE key = 'resend_from_email';
  SELECT value INTO v_base_url FROM app_secrets WHERE key = 'app_base_url';
  v_from := coalesce(v_from, 'Mexcon Autos <info@mexconautos.com>');
  v_track_url := coalesce(v_base_url, 'https://mexconautos.com') || '/track-order';

  v_subject := 'Payment confirmed for order ' || NEW.order_number;
  v_html :=
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#1f2937">' ||
    '<h2 style="color:#14532d;margin-bottom:4px">Payment confirmed</h2>' ||
    '<p style="margin-top:4px;color:#6b7280">Hi' || coalesce(' ' || NEW.customer_name, '') || ' — we have confirmed your payment of ' ||
    '<strong>NGN ' || NEW.total_amount || '</strong> for order <strong>' || NEW.order_number || '</strong>.</p>' ||
    '<p style="color:#6b7280">Your order is now being processed. Track it anytime: ' ||
    '<a href="' || v_track_url || '" style="color:#16a34a">' || v_track_url || '</a><br/>' ||
    'Use your order number <strong>' || NEW.order_number || '</strong> and the email you checked out with.</p>' ||
    '<p style="color:#9ca3af;font-size:12px;margin-top:24px">Mexcon Autos · Genuine Japanese and Korean auto parts<br/>Questions? Reply to this email or call us anytime.</p>' ||
    '</div>';

  v_job := net.http_post(
    url => 'https://api.resend.com/emails',
    headers => jsonb_build_object(
      'Authorization', 'Bearer ' || v_api_key,
      'Content-Type', 'application/json'
    ),
    body => jsonb_build_object(
      'from', v_from,
      'to', jsonb_build_array(NEW.customer_email),
      'subject', v_subject,
      'html', v_html
    ),
    timeout_milliseconds => 15000
  );

  INSERT INTO email_logs (order_id, email_type, job_id, status) VALUES (NEW.id, 'payment_confirmed', v_job, 'queued');

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  BEGIN
    INSERT INTO email_logs (order_id, email_type, status) VALUES (NEW.id, 'payment_confirmed', 'error:' || SQLERRM);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_payment_verified ON public.orders;
CREATE TRIGGER trg_notify_payment_verified
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  WHEN (OLD.payment_status IS DISTINCT FROM NEW.payment_status AND NEW.payment_status = 'paid')
  EXECUTE FUNCTION public.notify_payment_verified();
