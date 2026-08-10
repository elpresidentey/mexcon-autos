-- 20260810_search_normalization.sql
-- Fix parts search: OEM/part numbers are stored with dashes (e.g. '48510-07010')
-- but customers type them without (e.g. '4851007010'). Normalized generated
-- columns + pg_trgm indexes make both forms match, fast.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Normalized searchable copies (lowercase, digits+letters only)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS oem_number_clean text
    GENERATED ALWAYS AS (regexp_replace(lower(COALESCE(oem_number, '')), '[^a-z0-9]', '', 'g')) STORED;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS part_number_clean text
    GENERATED ALWAYS AS (regexp_replace(lower(COALESCE(part_number, '')), '[^a-z0-9]', '', 'g')) STORED;

-- Trigram indexes to keep ILIKE substring search fast as the catalogue grows
CREATE INDEX IF NOT EXISTS idx_products_oem_clean_trgm ON products USING gin (oem_number_clean gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_part_clean_trgm ON products USING gin (part_number_clean gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin ((name::text) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_description_trgm ON products USING gin ((description::text) gin_trgm_ops);