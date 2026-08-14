-- Public order tracking by product number: given a product / SKU / OEM /
-- part number plus the email it was placed with, return a jsonb ARRAY of
-- order summaries (an order may contain several matching items).
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
           o.payment_reference, o.tracking_number, o.tracking_url, o.customer_notes
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