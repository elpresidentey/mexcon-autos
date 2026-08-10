-- 20260810_search_products_rpc.sql
-- Relevance-ranked product search RPC used by the customer shop.
--
-- Ranking (additive weights):
--   name exact ......... 300      oem_clean exact ..... 250    part_clean exact ..... 200
--   name prefix ........ 150      oem_clean prefix ..... 120    part_clean prefix .... 100
--   name contains ...... 100      oem_clean contains ...  60    part_clean contains ..  50
--   compatible_models ..  25      compatibility_notes ...  12
--   description ........  15      specifications .......  10    raw oem/part ilike ...   8
--
-- OEM/part numbers are matched both raw AND normalized (no separators),
-- so '4851007010' finds '48510-07010'.
--
-- Returns a single row: { products: jsonb array of full joined objects, total: bigint }.

CREATE OR REPLACE FUNCTION public.search_products(
  p_search text DEFAULT NULL,
  p_category_id uuid DEFAULT NULL,
  p_brand_id uuid DEFAULT NULL,
  p_year integer DEFAULT NULL,
  p_manufacturer text DEFAULT NULL,
  p_engine_type text DEFAULT NULL,
  p_is_active boolean DEFAULT true,
  p_sort text DEFAULT 'relevance',
  p_sort_order text DEFAULT 'desc',
  p_page integer DEFAULT 1,
  p_per_page integer DEFAULT 12
)
RETURNS TABLE(products jsonb, total bigint)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  WITH matched AS (
    SELECT
      p.*,
      (
        (CASE WHEN COALESCE($1, '') <> '' AND lower(p.name) = lower(COALESCE($1, '')) THEN 300
              WHEN COALESCE($1, '') <> '' AND lower(p.name) LIKE lower(COALESCE($1, '')) || '%' THEN 150
              WHEN COALESCE($1, '') <> '' AND lower(p.name) LIKE '%' || lower(COALESCE($1, '')) || '%' THEN 100 ELSE 0 END)
        + (CASE WHEN regexp_replace(lower(COALESCE($1, '')), '[^a-z0-9]', '', 'g') <> '' AND p.oem_number_clean = regexp_replace(lower(COALESCE($1, '')), '[^a-z0-9]', '', 'g') THEN 250
                WHEN regexp_replace(lower(COALESCE($1, '')), '[^a-z0-9]', '', 'g') <> '' AND p.oem_number_clean LIKE regexp_replace(lower(COALESCE($1, '')), '[^a-z0-9]', '', 'g') || '%' THEN 120
                WHEN regexp_replace(lower(COALESCE($1, '')), '[^a-z0-9]', '', 'g') <> '' AND p.oem_number_clean LIKE '%' || regexp_replace(lower(COALESCE($1, '')), '[^a-z0-9]', '', 'g') || '%' THEN 60 ELSE 0 END)
        + (CASE WHEN regexp_replace(lower(COALESCE($1, '')), '[^a-z0-9]', '', 'g') <> '' AND p.part_number_clean = regexp_replace(lower(COALESCE($1, '')), '[^a-z0-9]', '', 'g') THEN 200
                WHEN regexp_replace(lower(COALESCE($1, '')), '[^a-z0-9]', '', 'g') <> '' AND p.part_number_clean LIKE regexp_replace(lower(COALESCE($1, '')), '[^a-z0-9]', '', 'g') || '%' THEN 100
                WHEN regexp_replace(lower(COALESCE($1, '')), '[^a-z0-9]', '', 'g') <> '' AND p.part_number_clean LIKE '%' || regexp_replace(lower(COALESCE($1, '')), '[^a-z0-9]', '', 'g') || '%' THEN 50 ELSE 0 END)
        + (CASE WHEN COALESCE($1, '') = '' THEN 0 ELSE
            (CASE WHEN p.compatible_models::text ILIKE '%' || COALESCE($1, '') || '%' THEN 25 ELSE 0 END
           + CASE WHEN p.compatibility_notes ILIKE '%' || COALESCE($1, '') || '%' THEN 12 ELSE 0 END
           + CASE WHEN p.description ILIKE '%' || COALESCE($1, '') || '%' THEN 15 ELSE 0 END
           + CASE WHEN p.specifications ILIKE '%' || COALESCE($1, '') || '%' THEN 10 ELSE 0 END
           + CASE WHEN p.oem_number ILIKE '%' || COALESCE($1, '') || '%' THEN 8 ELSE 0 END
           + CASE WHEN p.part_number ILIKE '%' || COALESCE($1, '') || '%' THEN 8 ELSE 0 END)
         END)
      ) AS rank
    FROM public.products p
    WHERE ($7 IS NULL OR p.is_active = $7)
      AND ($2 IS NULL OR p.category_id = $2)
      AND ($3 IS NULL OR p.brand_id = $3)
      AND ($6 IS NULL OR p.engine_type = $6)
      AND ($4 IS NULL OR p.compatible_models::text LIKE '%' || $4 || '%')
      AND ($5 IS NULL OR p.brand_id IN (SELECT b.id FROM public.brands b WHERE b.name ILIKE '%' || $5 || '%'))
      AND (COALESCE($1, '') = ''
           OR p.name ILIKE '%' || COALESCE($1, '') || '%'
           OR p.description ILIKE '%' || COALESCE($1, '') || '%'
           OR p.oem_number ILIKE '%' || COALESCE($1, '') || '%'
           OR p.part_number ILIKE '%' || COALESCE($1, '') || '%'
           OR p.compatibility_notes ILIKE '%' || COALESCE($1, '') || '%'
           OR p.specifications ILIKE '%' || COALESCE($1, '') || '%'
           OR p.compatible_models::text ILIKE '%' || COALESCE($1, '') || '%'
           OR (regexp_replace(lower(COALESCE($1, '')), '[^a-z0-9]', '', 'g') <> ''
               AND (p.oem_number_clean LIKE '%' || regexp_replace(lower(COALESCE($1, '')), '[^a-z0-9]', '', 'g') || '%'
                    OR p.part_number_clean LIKE '%' || regexp_replace(lower(COALESCE($1, '')), '[^a-z0-9]', '', 'g') || '%')))
  ),
  page AS (
    SELECT m.*
    FROM matched m
    ORDER BY
      (CASE WHEN $8 = 'relevance' THEN m.rank END) DESC NULLS LAST,
      (CASE WHEN $8 IN ('created_at', 'relevance') THEN m.created_at END) DESC NULLS LAST,
      (CASE WHEN $8 = 'price' AND $9 = 'asc' THEN m.price END) ASC NULLS LAST,
      (CASE WHEN $8 = 'price' AND $9 = 'desc' THEN m.price END) DESC NULLS LAST,
      (CASE WHEN $8 = 'name' THEN lower(m.name) END) ASC,
      (CASE WHEN $8 = 'view_count' THEN m.view_count END) DESC NULLS LAST,
      m.id
    LIMIT GREATEST($11, 1)
    OFFSET (GREATEST($10, 1) - 1) * GREATEST($11, 1)
  ),
  total AS (SELECT count(*) AS n FROM matched)
  SELECT
    COALESCE(jsonb_agg(
      to_jsonb(pp)
      || jsonb_build_object(
        'category', (SELECT to_jsonb(c) FROM public.categories c WHERE c.id = pp.category_id),
        'brand', (SELECT to_jsonb(b) FROM public.brands b WHERE b.id = pp.brand_id),
        'images', COALESCE((SELECT jsonb_agg(to_jsonb(pi) ORDER BY pi.order_index) FROM public.product_images pi WHERE pi.product_id = pp.id), '[]'::jsonb)
      )
    ), '[]'::jsonb),
    (SELECT n FROM total)
  FROM page pp;
$$;

GRANT EXECUTE ON FUNCTION public.search_products(text, uuid, uuid, integer, text, text, boolean, text, text, integer, integer) TO anon, authenticated;