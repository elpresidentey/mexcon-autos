-- Guest checkout support: contact snapshot on orders, a SECURITY DEFINER
-- order placement RPC for guests, and a public tracking RPC.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);

-- Place an order as a guest (no auth). SECURITY DEFINER so anon can insert.
-- Items are inserted in the same transaction.
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
  p_customer_notes text
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
    customer_name, customer_email, customer_notes
  ) VALUES (
    v_order_number, 'pending', 'pending', p_payment_method::public.payment_method,
    p_subtotal, p_shipping_cost, p_tax_amount, p_discount_amount, p_total_amount,
    p_shipping_address_line1, p_shipping_address_line2, p_shipping_city, p_shipping_state,
    p_shipping_postal_code, p_shipping_country, p_shipping_phone,
    p_customer_name, p_customer_email, p_customer_notes
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

REVOKE ALL ON FUNCTION public.place_guest_order(jsonb, text, numeric, numeric, numeric, numeric, numeric, text, text, text, text, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_guest_order(jsonb, text, numeric, numeric, numeric, numeric, numeric, text, text, text, text, text, text, text, text, text, text) TO anon, authenticated;

-- Public order tracking: given a real order number + the email it was placed
-- with (or the customer's email), return a limited order summary.
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
    'items', v_items
  );
END;
$$;

REVOKE ALL ON FUNCTION public.track_order(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_order(text, text) TO anon, authenticated;