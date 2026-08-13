-- 20260812: Product availability & condition
-- Adds stock status, condition/origin label, and warranty info so customers
-- can judge availability and part quality from the product page.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock_status TEXT NOT NULL DEFAULT 'in_stock'
    CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock', 'pre_order'));

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS condition_label TEXT NOT NULL DEFAULT 'genuine'
    CHECK (condition_label IN ('genuine', 'oem_equivalent', 'aftermarket', 'rebuilt', 'used'));

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS warranty_months INTEGER NOT NULL DEFAULT 6
    CHECK (warranty_months >= 0);
