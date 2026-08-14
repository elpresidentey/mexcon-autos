-- Branded welcome email for new customer accounts, sent via Resend using
-- the same pg_net pipeline as order confirmations (20260810_order_emails.sql):
--   - key/from/base URL come from app_secrets (never in the browser/repo)
--   - fire-and-forget, logged in email_logs for visibility

ALTER TABLE public.email_logs
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE;

-- Trigger: build the welcome email and hand it to pg_net.
CREATE OR REPLACE FUNCTION public.notify_customer_welcome()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_api_key text;
  v_from text;
  v_base_url text;
  v_first text;
  v_shop_url text;
  v_track_url text;
  v_subject text;
  v_html text;
  v_job bigint;
BEGIN
  IF NEW.email IS NULL OR btrim(NEW.email) = '' THEN
    RETURN NEW;
  END IF;

  SELECT value INTO v_api_key FROM app_secrets WHERE key = 'resend_api_key';
  IF v_api_key IS NULL THEN
    INSERT INTO email_logs (customer_id, email_type, status) VALUES (NEW.id, 'welcome', 'error:resend_api_key not configured');
    RETURN NEW;
  END IF;

  SELECT value INTO v_from FROM app_secrets WHERE key = 'resend_from_email';
  SELECT value INTO v_base_url FROM app_secrets WHERE key = 'app_base_url';
  v_from := coalesce(v_from, 'Mexcon Autos <info@mexconautos.com>');
  v_base_url := coalesce(v_base_url, 'https://mexconautos.com');
  v_shop_url := v_base_url || '/shop';
  v_track_url := v_base_url || '/track-order';

  v_first := coalesce(NULLIF(btrim(NEW.first_name), ''), 'there');
  v_subject := 'Welcome to Mexcon Autos, ' || v_first || '!';

  v_html :=
    '<div style="background:#f6f7f9;padding:32px 16px;font-family:Arial,Helvetica,sans-serif">' ||
    '<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">' ||

    -- Header
    '<div style="background:#0f172a;padding:28px 36px;text-align:center">' ||
    '<div style="display:inline-block;background:#f59e0b;border-radius:10px;width:48px;height:48px;line-height:48px;text-align:center;font-size:24px;font-weight:900;color:#0f172a">M</div>' ||
    '<h1 style="color:#ffffff;font-size:22px;margin:12px 0 0;letter-spacing:1px">MEXCON AUTOS</h1>' ||
    '<p style="color:#94a3b8;font-size:13px;margin:4px 0 0">Genuine Japanese &amp; Korean Auto Parts</p>' ||
    '</div>' ||

    -- Body
    '<div style="padding:32px 36px">' ||
    '<h2 style="color:#0f172a;font-size:20px;margin:0 0 8px">Welcome aboard, ' || v_first || '! 👋</h2>' ||
    '<p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 20px">Your Mexcon Autos account is ready. Order genuine parts for your Toyota, Lexus, Honda, Kia, Hyundai and more — delivered fast with easy tracking at every step.</p>' ||

    -- Benefits
    '<table style="width:100%;border-collapse:collapse;margin:0 0 24px">' ||
    '<tr>' ||
    '<td style="width:50%;padding:12px;background:#f8fafc;border-radius:10px 0 0 10px;vertical-align:top">' ||
    '<p style="font-size:14px;font-weight:700;color:#0f172a;margin:0 0 4px">🛒 Genuine parts</p>' ||
    '<p style="font-size:13px;color:#64748b;margin:0">OEM-quality Japanese &amp; Korean components, always in stock.</p>' ||
    '</td>' ||
    '<td style="width:50%;padding:12px;background:#f8fafc;border-radius:0 10px 10px 0;vertical-align:top">' ||
    '<p style="font-size:14px;font-weight:700;color:#0f172a;margin:0 0 4px">📦 Fast delivery</p>' ||
    '<p style="font-size:13px;color:#64748b;margin:0">Quick dispatch with order tracking on every shipment.</p>' ||
    '</td>' ||
    '</tr>' ||
    '<tr>' ||
    '<td style="width:50%;padding:12px;background:#f8fafc;border-radius:0 0 0 10px;vertical-align:top">' ||
    '<p style="font-size:14px;font-weight:700;color:#0f172a;margin:0 0 4px">🔍 Easy tracking</p>' ||
    '<p style="font-size:13px;color:#64748b;margin:0">Track any order by order number or product number.</p>' ||
    '</td>' ||
    '<td style="width:50%;padding:12px;background:#f8fafc;border-radius:0 0 10px 0;vertical-align:top">' ||
    '<p style="font-size:14px;font-weight:700;color:#0f172a;margin:0 0 4px">💬 WhatsApp support</p>' ||
    '<p style="font-size:13px;color:#64748b;margin:0">Talk to us directly when you need a hand.</p>' ||
    '</td>' ||
    '</tr>' ||
    '</table>' ||

    -- CTA
    '<div style="text-align:center;margin:0 0 24px">' ||
    '<a href="' || v_shop_url || '" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 36px;border-radius:10px">Browse the Shop</a>' ||
    '</div>' ||
    '<div style="text-align:center;margin:0 0 24px">' ||
    '<a href="' || v_track_url || '" style="color:#b45309;font-size:13px;font-weight:600;text-decoration:none">Track an Order →</a>' ||
    '</div>' ||

    '</div>' ||

    -- Footer
    '<div style="background:#0f172a;padding:20px 36px;text-align:center">' ||
    '<p style="color:#94a3b8;font-size:12px;margin:0 0 4px">Questions? Call or WhatsApp us — we are happy to help.</p>' ||
    '<p style="color:#e2e8f0;font-size:13px;font-weight:600;margin:0">+234 903 577 7779 · info@mexconautos.com</p>' ||
    '<p style="color:#64748b;font-size:11px;margin:8px 0 0">© Mexcon Autos. Genuine Japanese &amp; Korean auto parts.</p>' ||
    '</div>' ||

    '</div>' ||
    '</div>';

  v_job := net.http_post(
    url => 'https://api.resend.com/emails',
    headers => jsonb_build_object(
      'Authorization', 'Bearer ' || v_api_key,
      'Content-Type', 'application/json'
    ),
    body => jsonb_build_object(
      'from', v_from,
      'to', jsonb_build_array(NEW.email),
      'subject', v_subject,
      'html', v_html
    ),
    timeout_milliseconds => 15000
  );

  INSERT INTO email_logs (customer_id, email_type, job_id, status) VALUES (NEW.id, 'welcome', v_job, 'queued');

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  BEGIN
    INSERT INTO email_logs (customer_id, email_type, status) VALUES (NEW.id, 'welcome', 'error:' || SQLERRM);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_customer_welcome ON public.customers;
CREATE TRIGGER trg_notify_customer_welcome
  AFTER INSERT ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_customer_welcome();