-- Transactional order confirmation email via Resend.
--
-- Order sends are triggered straight from the database (AFTER INSERT on
-- orders) using the pg_net extension's async HTTP client, so:
--   - the Resend API key never touches the browser or the repo
--   - order placement never blocks on email delivery (fire-and-forget)
--   - both guest orders (place_guest_order RPC) and logged-in orders get it
--
-- The key and sender config live in app_secrets (seeded at deploy time,
-- NOT in this file):
--   resend_api_key    -> Resend API key
--   resend_from_email -> "Mexcon Autos <info@mexconautos.com>"
--   app_base_url      -> e.g. https://mexconautos.com (for the tracking link)

CREATE EXTENSION IF NOT EXISTS pg_net;

-- Secrets table: RLS enabled with no policies -> only the postgres role
-- (and SECURITY DEFINER functions owned by it) can read these values.
CREATE TABLE IF NOT EXISTS public.app_secrets (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;

-- Delivery log: one row per attempted send so failures are visible.
CREATE TABLE IF NOT EXISTS public.email_logs (
  id BIGSERIAL PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL DEFAULT 'order_confirmation',
  status TEXT NOT NULL,
  job_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Trigger: build the confirmation email and hand it to pg_net.
CREATE OR REPLACE FUNCTION public.notify_order_placed()
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
  v_items_html text := '';
  v_meta jsonb;
  v_subject text;
  v_html text;
  v_job bigint;
  v_item record;
BEGIN
  IF NEW.customer_email IS NULL OR btrim(NEW.customer_email) = '' THEN
    RETURN NEW;
  END IF;

  SELECT value INTO v_api_key FROM app_secrets WHERE key = 'resend_api_key';
  IF v_api_key IS NULL THEN
    INSERT INTO email_logs (order_id, status) VALUES (NEW.id, 'error:resend_api_key not configured');
    RETURN NEW;
  END IF;

  SELECT value INTO v_from FROM app_secrets WHERE key = 'resend_from_email';
  SELECT value INTO v_base_url FROM app_secrets WHERE key = 'app_base_url';
  v_from := coalesce(v_from, 'Mexcon Autos <info@mexconautos.com>');
  v_track_url := coalesce(v_base_url, 'https://mexconautos.com') || '/track-order';

  FOR v_item IN
    SELECT product_name, quantity, unit_price, total_price
    FROM order_items WHERE order_id = NEW.id
    ORDER BY id
  LOOP
    v_items_html := v_items_html ||
      '<tr>' ||
      '<td style="padding:8px;border-bottom:1px solid #e5e7eb">' || v_item.product_name || '</td>' ||
      '<td align="center" style="padding:8px;border-bottom:1px solid #e5e7eb">' || v_item.quantity || '</td>' ||
      '<td align="right" style="padding:8px;border-bottom:1px solid #e5e7eb">NGN ' || v_item.total_price || '</td>' ||
      '</tr>';
  END LOOP;

  v_subject := 'Your Mexcon Autos order ' || NEW.order_number || ' is confirmed';
  v_html :=
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#1f2937">' ||
    '<h2 style="color:#14532d;margin-bottom:4px">Order ' || NEW.order_number || ' confirmed</h2>' ||
    '<p style="margin-top:4px;color:#6b7280">Thank you' || coalesce(' ' || NEW.customer_name, '') || ' — we have received your order.</p>' ||
    '<table style="width:100%;border-collapse:collapse;margin:16px 0">' ||
    '<tr style="background:#f0fdf4">' ||
    '<th align="left" style="padding:8px;border-bottom:1px solid #d1d5db">Part</th>' ||
    '<th align="center" style="padding:8px;border-bottom:1px solid #d1d5db">Qty</th>' ||
    '<th align="right" style="padding:8px;border-bottom:1px solid #d1d5db">Price</th>' ||
    '</tr>' ||
    v_items_html ||
    '<tr><td colspan="2" align="right" style="padding:8px;color:#6b7280">Subtotal</td><td align="right" style="padding:8px">NGN ' || NEW.subtotal || '</td></tr>' ||
    '<tr><td colspan="2" align="right" style="padding:8px;color:#6b7280">Shipping</td><td align="right" style="padding:8px">NGN ' || coalesce(NEW.shipping_cost, 0) || '</td></tr>' ||
    '<tr><td colspan="2" align="right" style="padding:8px;font-weight:bold">Total</td><td align="right" style="padding:8px;font-weight:bold">NGN ' || NEW.total_amount || '</td></tr>' ||
    '</table>' ||
    '<p style="color:#6b7280">Payment: <strong>' || NEW.payment_method || '</strong> (status: ' || NEW.payment_status || ')</p>' ||
    '<p style="color:#6b7280">Track your order anytime: <a href="' || v_track_url || '" style="color:#16a34a">' || v_track_url || '</a><br/>' ||
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

  INSERT INTO email_logs (order_id, job_id, status) VALUES (NEW.id, v_job, 'queued');

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  BEGIN
    INSERT INTO email_logs (order_id, status) VALUES (NEW.id, 'error:' || SQLERRM);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_order_placed ON public.orders;
CREATE TRIGGER trg_notify_order_placed
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_placed();