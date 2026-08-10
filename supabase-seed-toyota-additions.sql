-- 20260810_toyota_catalogue_expansion.sql
-- Popular Toyota products to round out the catalogue (Corolla focus).
-- Each product carries compatible_models entries aligned with the
-- VehicleSearch year options (src/data/vehicles.ts) so the year filter
-- actually returns results, e.g. 'Corolla 2013'.
-- Idempotent: existing rows are never overwritten.

INSERT INTO products (name, category_id, brand_id, price, description, oem_number, part_number, is_featured, is_active, primary_image_url, compatible_models)
SELECT
    p.name,
    COALESCE((SELECT id FROM categories WHERE slug = p.cat_slug LIMIT 1), (SELECT id FROM categories LIMIT 1)),
    COALESCE((SELECT id FROM brands WHERE slug = p.brand_slug LIMIT 1), (SELECT id FROM brands LIMIT 1)),
    p.price,
    p.description,
    p.oem_number,
    p.part_number,
    p.is_featured,
    p.is_active,
    p.primary_image_url,
    p.compatible_models
FROM (VALUES
-- ===== Corolla =====
('Toyota Corolla Front Brake Pads (Set)', 'brake-system', 'toyota', 15000.00, 'Ceramic front brake pads for Toyota Corolla 1.8L', '04465-02140', 'BP-TOY-COR-F', true, true, '/brake-system.webp', ARRAY['Corolla 2008','Corolla 2013','Corolla 2017','1.8L 2ZR-FE','1.6L 1ZR-FE']),
('Toyota Corolla Rear Brake Pads (Set)', 'brake-system', 'toyota', 14000.00, 'Ceramic rear brake pads for Toyota Corolla 1.8L', '04466-02140', 'BP-TOY-COR-R', false, true, '/brake-system.webp', ARRAY['Corolla 2008','Corolla 2013','Corolla 2017','1.8L 2ZR-FE']),
('Toyota Corolla Front Brake Discs (Pair)', 'brake-system', 'toyota', 28000.00, 'Vented front brake discs for Toyota Corolla 1.8L', '43512-02040', 'BD-TOY-COR-F', true, true, '/brake-system.webp', ARRAY['Corolla 2008','Corolla 2013','1.8L 2ZR-FE']),
('Toyota Corolla Engine Oil Filter', 'oil-filter', 'toyota', 3000.00, 'Genuine engine oil filter for Toyota Corolla 1.8L', '04152-YZZA4', 'OF-TOY-COR', true, true, '/car-engine.webp', ARRAY['Corolla 2008','Corolla 2013','Corolla 2017','1.8L 2ZR-FE','1.6L 1ZR-FE']),
('Toyota Corolla Air Filter', 'air-filters', 'toyota', 4200.00, 'Premium air filter for Toyota Corolla 1.8L', '17801-21010', 'AF-TOY-COR', false, true, '/car-engine.webp', ARRAY['Corolla 2008','Corolla 2013','Corolla 2017','1.8L 2ZR-FE']),
('Toyota Corolla Iridium Spark Plugs (Set of 4)', 'spark-plugs', 'toyota', 14000.00, 'Iridium spark plugs set of 4 for Toyota Corolla 1.8L', '90919-01247', 'SP-TOY-COR-4', false, true, '/car-engine.webp', ARRAY['Corolla 2008','Corolla 2013','1.8L 2ZR-FE']),
('Toyota Corolla Ignition Coil (Set of 4)', 'electrical-components', 'toyota', 38000.00, 'Set of 4 ignition coils for Toyota Corolla 1.8L', '90919-02255', 'IC-TOY-COR-4', false, true, '/car-engine.webp', ARRAY['Corolla 2008','Corolla 2013','1.8L 2ZR-FE']),
('Toyota Corolla Water Pump', 'cooling-system', 'toyota', 13500.00, 'Water pump for Toyota Corolla 1.8L', '16100-29065', 'WP-TOY-COR', false, true, '/car-engine.webp', ARRAY['Corolla 2008','Corolla 2013','1.8L 2ZR-FE']),
('Toyota Corolla Radiator Assembly', 'cooling-system', 'toyota', 48000.00, 'Aluminum radiator assembly for Toyota Corolla 1.8L', '16400-0T010', 'RAD-TOY-COR', false, true, '/car-engine.webp', ARRAY['Corolla 2008','Corolla 2013','1.8L 2ZR-FE']),
('Toyota Corolla Front Shock Absorbers (Pair)', 'suspension', 'toyota', 42000.00, 'Gas-charged front shock absorbers for Toyota Corolla 1.8L', '48510-02010', 'SA-TOY-COR-F', true, true, '/wesley-tingey-2fTXCO4Cz1A-unsplash.webp', ARRAY['Corolla 2008','Corolla 2013','1.8L 2ZR-FE']),
('Toyota Corolla Alternator', 'electrical-components', 'toyota', 78000.00, 'Remanufactured alternator for Toyota Corolla 1.8L', '27060-0T150', 'ALT-TOY-COR', false, true, '/car-engine.webp', ARRAY['Corolla 2008','Corolla 2013','1.8L 2ZR-FE']),
('Toyota Corolla Starter Motor', 'electrical-components', 'toyota', 65000.00, 'Remanufactured starter motor for Toyota Corolla 1.8L', '28100-0T010', 'STM-TOY-COR', false, true, '/car-engine.webp', ARRAY['Corolla 2008','Corolla 2013','1.8L 2ZR-FE']),
('Toyota Corolla Fuel Pump Assembly', 'fuel-system', 'toyota', 35000.00, 'Electric fuel pump assembly for Toyota Corolla 1.8L', '23221-0T010', 'FP-TOY-COR', true, true, '/car-engine.webp', ARRAY['Corolla 2008','Corolla 2013','1.8L 2ZR-FE']),
('Toyota Corolla CVT Fluid (4L)', 'oils-lubricants', 'toyota', 9500.00, 'Genuine Toyota CVT-FE transmission fluid (4L)', '08886-02105', 'TF-TOY-COR-CVT', false, true, '/transmission.webp', ARRAY['Corolla 2008','Corolla 2013','Corolla 2017','1.8L 2ZR-FE']),
('Toyota Corolla Headlight Assembly (Left)', 'lighting', 'toyota', 48000.00, 'OEM left headlight assembly for Toyota Corolla 1.8L', '81110-02110', 'HL-TOY-COR-L', false, true, '/brake-system.webp', ARRAY['Corolla 2008','Corolla 2013','1.8L 2ZR-FE']),
('Toyota Corolla Cabin Air Filter', 'air-filters', 'toyota', 4500.00, 'Cabin air filter for Toyota Corolla 1.8L', '87139-02020', 'CAF-TOY-COR', false, true, '/car-engine.webp', ARRAY['Corolla 2008','Corolla 2013','Corolla 2017','1.8L 2ZR-FE']),
('Toyota Corolla Suspension Lower Arm (Front Left)', 'suspension', 'toyota', 26000.00, 'Front lower control arm for Toyota Corolla 1.8L', '48068-02130', 'LCA-TOY-COR-FL', false, true, '/suspension.webp', ARRAY['Corolla 2008','Corolla 2013','1.8L 2ZR-FE']),
('Toyota Corolla Drive Belt', 'engine-components', 'toyota', 6500.00, 'Drive belt for Toyota Corolla 1.8L', '90916-02468', 'DB-TOY-COR', false, true, '/car-engine.webp', ARRAY['Corolla 2008','Corolla 2013','1.8L 2ZR-FE']),

-- ===== Hilux =====
('Toyota Hilux Front Brake Pads (Set)', 'brake-system', 'toyota', 18000.00, 'Brake pads for Toyota Hilux (Vigo) 3.0L diesel', '04465-0K150', 'BP-TOY-HLX-F', true, true, '/brake-system.webp', ARRAY['Hilux 2010','Hilux 2015','Hilux 2018','3.0L 1KD-FTV Diesel','2.7L 2TR-FE']),
('Toyota Hilux Rear Brake Shoes (Set)', 'brake-system', 'toyota', 13000.00, 'Rear brake shoe set for Toyota Hilux (Vigo)', '04495-0K030', 'BS-TOY-HLX-R', false, true, '/brake-system.webp', ARRAY['Hilux 2010','Hilux 2015','3.0L 1KD-FTV Diesel']),
('Toyota Hilux Engine Oil Filter (Diesel)', 'oil-filter', 'toyota', 3500.00, 'Genuine oil filter for Toyota Hilux diesel', '90915-YZZE1', 'OF-TOY-HLX', false, true, '/car-engine.webp', ARRAY['Hilux 2005','Hilux 2010','Hilux 2015','3.0L 1KD-FTV Diesel','2.4L 2L Diesel']),
('Toyota Hilux Front Shock Absorbers (Pair)', 'suspension', 'toyota', 52000.00, 'Gas-charged front shock absorbers for Toyota Hilux', '48510-0K061', 'SA-TOY-HLX-F', true, true, '/wesley-tingey-2fTXCO4Cz1A-unsplash.webp', ARRAY['Hilux 2010','Hilux 2015','3.0L 1KD-FTV Diesel']),
('Toyota Hilux Clutch Kit', 'transmission', 'toyota', 85000.00, 'Complete clutch kit for Toyota Hilux manual transmission', '31250-0K050', 'CK-TOY-HLX', false, true, '/transmission.webp', ARRAY['Hilux 2010','Hilux 2015','3.0L 1KD-FTV Diesel']),

-- ===== RAV4 =====
('Toyota RAV4 Front Brake Pads (Set)', 'brake-system', 'toyota', 16500.00, 'Ceramic front brake pads for Toyota RAV4 2.5L', '04465-0R050', 'BP-TOY-RAV-F', true, true, '/brake-system.webp', ARRAY['RAV4 2006','RAV4 2010','RAV4 2013','RAV4 2018','2.5L 2AR-FE']),
('Toyota RAV4 Cabin Air Filter', 'air-filters', 'toyota', 5000.00, 'Cabin air filter for Toyota RAV4 2.5L', '87139-0R010', 'CAF-TOY-RAV', false, true, '/car-engine.webp', ARRAY['RAV4 2013','RAV4 2018','2.5L 2AR-FE']),

-- ===== Prado =====
('Toyota Prado Front Brake Pads (Set)', 'brake-system', 'toyota', 22000.00, 'Brake pads for Toyota Land Cruiser Prado 2.7L', '04465-60080', 'BP-TOY-PRD-F', false, true, '/brake-system.webp', ARRAY['Prado 2009','Prado 2013','Prado 2018','2.7L 2TR-FE','3.0L 1KD-FTV Diesel']),
('Toyota Prado Engine Oil Filter (Diesel)', 'oil-filter', 'toyota', 4000.00, 'Genuine oil filter for Toyota Prado diesel', '90915-30002', 'OF-TOY-PRD', true, true, '/car-engine.webp', ARRAY['Prado 2009','Prado 2013','Prado 2018','3.0L 1KD-FTV Diesel']),

-- ===== Yaris =====
('Toyota Yaris Front Brake Pads (Set)', 'brake-system', 'toyota', 12500.00, 'Brake pads for Toyota Yaris 1.5L', '04465-52010', 'BP-TOY-YRS-F', false, true, '/brake-system.webp', ARRAY['Yaris 2005','Yaris 2010','Yaris 2014','1.5L 1NZ-FE','1.3L 2NZ-FE']),
('Toyota Yaris Engine Oil Filter', 'oil-filter', 'toyota', 2800.00, 'Genuine oil filter for Toyota Yaris 1.5L', '90915-YZZD1', 'OF-TOY-YRS', false, true, '/car-engine.webp', ARRAY['Yaris 2010','Yaris 2014','1.5L 1NZ-FE']),

-- ===== Land Cruiser =====
('Toyota Land Cruiser Air Filter', 'air-filters', 'toyota', 6500.00, 'Air filter for Toyota Land Cruiser 4.7L', '17801-31030', 'AF-TOY-LCR', true, true, '/car-engine.webp', ARRAY['Land Cruiser 2008','Land Cruiser 2013','Land Cruiser 2016','4.7L 2UZ-FE','4.2L 1HZ Diesel']),

-- ===== Highlander =====
('Toyota Highlander Front Brake Pads (Set)', 'brake-system', 'toyota', 19000.00, 'Ceramic front brake pads for Toyota Highlander 3.5L', '04465-48020', 'BP-TOY-HIG-F', false, true, '/brake-system.webp', ARRAY['Highlander 2008','Highlander 2013','Highlander 2017','3.5L 2GR-FE']),
('Toyota Highlander Engine Oil Filter', 'oil-filter', 'toyota', 3800.00, 'Genuine oil filter for Toyota Highlander', '90915-YZZD3', 'OF-TOY-HIG', false, true, '/car-engine.webp', ARRAY['Highlander 2008','Highlander 2013','3.5L 2GR-FE'])
) AS p(name, cat_slug, brand_slug, price, description, oem_number, part_number, is_featured, is_active, primary_image_url, compatible_models)
ON CONFLICT DO NOTHING;