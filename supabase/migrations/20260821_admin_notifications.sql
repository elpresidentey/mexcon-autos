-- Admin / customer-service notification emails via Resend (same pg_net
-- pipeline as 20260810_order_emails.sql):
--   1. app_secrets.admin_notify_email -> where staff alerts are sent
--   2. New enquiry (contact form or quote request) -> alert to staff
--   3. New order -> short alert to staff (customer confirmation is separate)
--
-- Fire-and-forget: failures are logged in email_logs and never block writes.

-- 1. Staff notification recipient ------------------------------------------------
INSERT INTO public.app_secrets (key, value)
VALUES ('admin_notify_email', 'support@mextechautospareparts.com')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- 2. Enquiry alert ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_admin_enquiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_api_key text;
  v_from text;
  v_to text;
  v_subject text;
  v_html text;
  v_job bigint;
BEGIN
  SELECT value INTO v_api_key FROM app_secrets WHERE key = 'resend_api_key';
  IF v_api_key IS NULL OR btrim(v_api_key) = '' THEN
    INSERT INTO email_logs (email_type, status) VALUES ('admin_enquiry', 'error:resend_api_key not configured');
    RETURN NEW;
  END IF;

  SELECT value INTO v_from FROM app_secrets WHERE key = 'resend_from_email';
  SELECT value INTO v_to FROM app_secrets WHERE key = 'admin_notify_email';
  IF v_to IS NULL OR btrim(v_to) = '' THEN
    INSERT INTO email_logs (email_type, status) VALUES ('admin_enquiry', 'error:admin_notify_email not configured');
    RETURN NEW;
  END IF;

  v_subject := 'New enquiry from ' || coalesce(NEW.customer_name, 'a customer');

  v_html := '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111">' ||
    '<h2 style="color:#166534">New customer enquiry</h2>' ||
    '<table style="width:100%;border-collapse:collapse;margin:16px 0">' ||
    '<tr><td style="padding:6px;border-bottom:1px solid #e5e7eb;width:130px;color:#6b7280">Name</td><td style="padding:6px;border-bottom:1px solid #e5e7eb">' || coalesce(NEW.customer_name, '-') || '</td></tr>' ||
    '<tr><td style="padding:6px;border-bottom:1px solid #e5e7eb;color:#6b7280">Email</td><td style="padding:6px;border-bottom:1px solid #e5e7eb">' || coalesce(NEW.customer_email, '-') || '</td></tr>' ||
    '<tr><td style="padding:6px;border-bottom:1px solid #e5e7eb;color:#6b7280">Phone</td><td style="padding:6px;border-bottom:1px solid #e5e7eb">' || coalesce(NEW.customer_phone, '-') || '</td></tr>' ||
    '<tr><td style="padding:6px;border-bottom:1px solid #e5e7eb;color:#6b7280">Vehicle</td><td style="padding:6px;border-bottom:1px solid #e5e7eb">' || coalesce(NEW.vehicle_details, '-') || '</td></tr>' ||
    '</table>' ||
    '<p style="color:#6b7280;margin-top:12px"><strong>Message:</strong></p>' ||
    '<p style="white-space:pre-wrap">' || coalesce(NEW.message, '-') || '</p>' ||
    '<p style="color:#9ca3af;font-size:12px;margin-top:24px">Mexcon Autos admin alert · reply directly to the customer by email or WhatsApp.</p>' ||
    '</div>';

  v_job := net.http_post(
    url => 'https://api.resend.com/emails',
    headers => jsonb_build_object(
      'Authorization', 'Bearer ' || v_api_key,
      'Content-Type', 'application/json'
    ),
    body => jsonb_build_object(
      'from', v_from,
      'to', jsonb_build_array(v_to),
      'reply_to', coalesce(nullif(btrim(NEW.customer_email), ''), NULL),
      'subject', v_subject,
      'html', v_html
    ),
    timeout_milliseconds => 15000
  );

  INSERT INTO email_logs (job_id, email_type, status) VALUES (v_job, 'admin_enquiry', 'queued');

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  BEGIN
    INSERT INTO email_logs (email_type, status) VALUES ('admin_enquiry', 'error:' || SQLERRM);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admin_enquiry ON public.enquiries;
CREATE TRIGGER trg_notify_admin_enquiry
  AFTER INSERT ON public.enquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_enquiry();

-- 3. New-order staff alert ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_admin_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_api_key text;
  v_from text;
  v_to text;
  v_subject text;
  v_html text;
  v_job bigint;
BEGIN
  SELECT value INTO v_api_key FROM app_secrets WHERE key = 'resend_api_key';
  IF v_api_key IS NULL OR btrim(v_api_key) = '' THEN
    INSERT INTO email_logs (order_id, email_type, status) VALUES (NEW.id, 'admin_order_alert', 'error:resend_api_key not configured');
    RETURN NEW;
  END IF;

  SELECT value INTO v_from FROM app_secrets WHERE key = 'resend_from_email';
  SELECT value INTO v_to FROM app_secrets WHERE key = 'admin_notify_email';
  IF v_to IS NULL OR btrim(v_to) = '' THEN
    INSERT INTO email_logs (order_id, email_type, status) VALUES (NEW.id, 'admin_order_alert', 'error:admin_notify_email not configured');
    RETURN NEW;
  END IF;

  v_subject := 'New order ' || NEW.order_number || ' — NGN ' || NEW.total_amount;

  v_html := '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111">' ||
    '<h2 style="color:#166534">New order received</h2>' ||
    '<table style="width:100%;border-collapse:collapse;margin:16px 0">' ||
    '<tr><td style="padding:6px;border-bottom:1px solid #e5e7eb;width:130px;color:#6b7280">Order</td><td style="padding:6px;border-bottom:1px solid #e5e7eb"><strong>' || NEW.order_number || '</strong></td></tr>' ||
    '<tr><td style="padding:6px;border-bottom:1px solid #e5e7eb;color:#6b7280">Customer</td><td style="padding:6px;border-bottom:1px solid #e5e7eb">' || coalesce(NEW.customer_name, '-') || '</td></tr>' ||
    '<tr><td style="padding:6px;border-bottom:1px solid #e5e7eb;color:#6b7280">Email</td><td style="padding:6px;border-bottom:1px solid #e5e7eb">' || coalesce(NEW.customer_email, '-') || '</td></tr>' ||
    '<tr><td style="padding:6px;border-bottom:1px solid #e5e7eb;color:#6b7280">Total</td><td style="padding:6px;border-bottom:1px solid #e5e7eb">NGN ' || NEW.total_amount || '</td></tr>' ||
    '<tr><td style="padding:6px;color:#6b7280">Payment</td><td style="padding:6px">' || NEW.payment_method || ' (' || NEW.payment_status || ')</td></tr>' ||
    '</table>' ||
    '<p style="color:#9ca3af;font-size:12px;margin-top:24px">Mexcon Autos admin alert · manage this order in the admin dashboard.</p>' ||
    '</div>';

  v_job := net.http_post(
    url => 'https://api.resend.com/emails',
    headers => jsonb_build_object(
      'Authorization', 'Bearer ' || v_api_key,
      'Content-Type', 'application/json'
    ),
    body => jsonb_build_object(
      'from', v_from,
      'to', jsonb_build_array(v_to),
      'reply_to', coalesce(nullif(btrim(NEW.customer_email), ''), NULL),
      'subject', v_subject,
      'html', v_html
    ),
    timeout_milliseconds => 15000
  );

  INSERT INTO email_logs (order_id, job_id, email_type, status) VALUES (NEW.id, v_job, 'admin_order_alert', 'queued');

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  BEGIN
    INSERT INTO email_logs (order_id, email_type, status) VALUES (NEW.id, 'admin_order_alert', 'error:' || SQLERRM);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admin_order ON public.orders;
CREATE TRIGGER trg_notify_admin_order
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_order();
