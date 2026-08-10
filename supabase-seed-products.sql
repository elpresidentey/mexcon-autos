-- Sample Products for Mexcon Autos
-- Run this script after the main schema is already in place
-- This only inserts sample products without recreating tables/types

-- First, let's check if categories and brands exist
DO $$
DECLARE
    cat_count INTEGER;
    brand_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO cat_count FROM categories;
    SELECT COUNT(*) INTO brand_count FROM brands;
    
    IF cat_count = 0 THEN
        RAISE NOTICE 'No categories found. Please run the main schema first.';
    END IF;
    
    IF brand_count = 0 THEN
        RAISE NOTICE 'No brands found. Please run the main schema first.';
    END IF;
    
    RAISE NOTICE 'Categories: %, Brands: %', cat_count, brand_count;
END $$;

-- Sample Products with fallback to first category/brand if slug not found
INSERT INTO products (name, category_id, brand_id, price, description, oem_number, part_number, is_featured, is_active, primary_image_url)
SELECT 
    p.name,
    COALESCE(
        (SELECT id FROM categories WHERE slug = p.cat_slug LIMIT 1),
        (SELECT id FROM categories LIMIT 1)
    ),
    COALESCE(
        (SELECT id FROM brands WHERE slug = p.brand_slug LIMIT 1),
        (SELECT id FROM brands LIMIT 1)
    ),
    p.price,
    p.description,
    p.oem_number,
    p.part_number,
    p.is_featured,
    p.is_active,
    p.primary_image_url
FROM (VALUES
-- Engine Components
('Toyota Camry 2.5L Timing Belt Kit', 'engine-components', 'toyota', 45000.00, 'Complete timing belt kit including belt, tensioner, and idler pulleys for Toyota Camry 2.5L engine', '13568-09010', 'TK-TOY-CAM-25', true, true, '/car-engine.webp'),
('Honda Accord 2.4L Oil Filter', 'engine-components', 'honda', 3500.00, 'High-quality oil filter for Honda Accord 2.4L engine', '15400-PLM-A01', 'OF-HON-ACC-24', true, true, '/car-engine.webp'),
('Nissan Altima 2.5L Air Filter', 'engine-components', 'nissan', 4500.00, 'Premium air filter for Nissan Altima 2.5L engine', '16546-0J000', 'AF-NIS-ALT-25', false, true, '/car-engine.webp'),
('Hyundai Elantra 1.8L Spark Plugs (Set of 4)', 'engine-components', 'hyundai', 12000.00, 'Iridium spark plugs set for Hyundai Elantra 1.8L engine', '18855-10060', 'SP-HYU-ELN-18', false, true, '/car-engine.webp'),

-- Brake System
('Toyota Camry Front Brake Pads (Set)', 'brake-system', 'toyota', 18000.00, 'Ceramic front brake pads for Toyota Camry', '04465-07010', 'BP-TOY-CAM-F', true, true, '/brake-system.webp'),
('Honda Accord Rear Brake Discs (Pair)', 'brake-system', 'honda', 35000.00, 'Vented rear brake discs for Honda Accord', '42510-TR0-A00', 'BD-HON-ACC-R', true, true, '/brake-system.webp'),
('Nissan Altima Brake Caliper (Front Left)', 'brake-system', 'nissan', 45000.00, 'Remanufactured front left brake caliper for Nissan Altima', '44010-5Y000', 'BC-NIS-ALT-FL', false, true, '/brake-system.webp'),

-- Suspension
('Toyota Camry Front Shock Absorbers (Pair)', 'suspension', 'toyota', 55000.00, 'Gas-charged front shock absorbers for Toyota Camry', '48510-07010', 'SA-TOY-CAM-F', true, true, '/wesley-tingey-2fTXCO4Cz1A-unsplash.webp'),
('Honda Accord Rear Strut Assembly (Pair)', 'suspension', 'honda', 65000.00, 'Complete rear strut assemblies for Honda Accord', '52602-TVA-A01', 'RS-HON-ACC-R', false, true, '/wesley-tingey-2fTXCO4Cz1A-unsplash.webp'),

-- Transmission
('Toyota Camry Automatic Transmission Fluid', 'transmission', 'toyota', 8500.00, 'Genuine Toyota ATF WS transmission fluid (4L)', '00279-ATFWS', 'TF-TOY-ATFWS', true, true, '/transmission.webp'),
('Honda Accord CVT Fluid', 'transmission', 'honda', 9500.00, 'Honda HCF-2 CVT fluid (4L)', '08200-9007', 'TF-HON-CVT', false, true, '/transmission.webp'),

-- Steering
('Toyota Camry Power Steering Pump', 'steering', 'toyota', 75000.00, 'Remanufactured power steering pump for Toyota Camry', '44350-07010', 'PSP-TOY-CAM', true, true, '/steering-pumps.webp'),
('Honda Accord Steering Rack', 'steering', 'honda', 85000.00, 'Remanufactured steering rack for Honda Accord', '53600-TVA-A01', 'SR-HON-ACC', false, true, '/steering-pumps.webp'),

-- Electrical Components
('Toyota Camry Alternator', 'electrical-components', 'toyota', 95000.00, 'Remanufactured alternator for Toyota Camry 2.5L', '27060-07010', 'ALT-TOY-CAM', true, true, '/car-engine.webp'),
('Honda Accord Starter Motor', 'electrical-components', 'honda', 85000.00, 'Remanufactured starter for Honda Accord 2.4L', '31200-RBB-004', 'STM-HON-ACC', false, true, '/car-engine.webp'),

-- Cooling System
('Toyota Camry Radiator', 'cooling-system', 'toyota', 65000.00, 'Aluminum radiator for Toyota Camry 2.5L', '16400-07010', 'RAD-TOY-CAM', true, true, '/car-engine.webp'),
('Honda Accord Water Pump', 'cooling-system', 'honda', 15000.00, 'Water pump for Honda Accord 2.4L', '19200-RBB-004', 'WP-HON-ACC', false, true, '/car-engine.webp'),

-- Lubricants
('Toyota 5W-30 Synthetic Engine Oil (5L)', 'oils-lubricants', 'toyota', 12000.00, 'Genuine Toyota 5W-30 synthetic motor oil', '08880-82380', 'EO-TOY-5W30', true, true, '/car-engine.webp'),
('Honda 0W-20 Synthetic Oil (5L)', 'oils-lubricants', 'honda', 13000.00, 'Honda Genuine 0W-20 synthetic motor oil', '08798-9033', 'EO-HON-0W20', false, true, '/car-engine.webp'),

-- Filters
('Toyota Camry Oil Filter', 'filters', 'toyota', 3500.00, 'OEM oil filter for Toyota Camry', '04152-YZZA1', 'OF-TOY-CAM', true, true, '/car-engine.webp'),
('Honda Accord Cabin Air Filter', 'filters', 'honda', 4000.00, 'Cabin air filter for Honda Accord', '80292-TVA-A01', 'CAF-HON-ACC', false, true, '/car-engine.webp'),

-- Body Parts
('Toyota Camry Front Bumper', 'body-parts', 'toyota', 85000.00, 'OEM front bumper for Toyota Camry', '52119-07010', 'FB-TOY-CAM', true, true, '/car-engine.webp'),
('Honda Accord Left Fender', 'body-parts', 'honda', 75000.00, 'OEM left front fender for Honda Accord', '60211-TVA-A00', 'LF-HON-ACC', false, true, '/car-engine.webp'),

-- Lighting
('Toyota Camry Headlight Assembly (Left)', 'lighting', 'toyota', 55000.00, 'OEM left headlight assembly for Toyota Camry', '81150-07010', 'HL-TOY-CAM-L', true, true, '/brake-system.webp'),
('Honda Accord LED Tail Light (Left)', 'lighting', 'honda', 65000.00, 'OEM LED tail light for Honda Accord', '33551-TVA-A01', 'TL-HON-ACC-L', false, true, '/brake-system.webp'),

-- Fuel System
('Toyota Camry Fuel Pump', 'fuel-system', 'toyota', 45000.00, 'Electric fuel pump for Toyota Camry', '23217-07010', 'FP-TOY-CAM', true, true, '/car-engine.webp'),
('Honda Accord Fuel Injector (Set of 4)', 'fuel-system', 'honda', 55000.00, 'Set of 4 fuel injectors for Honda Accord', '16450-RBB-A01', 'FI-HON-ACC-4', false, true, '/car-engine.webp')
) AS p(name, cat_slug, brand_slug, price, description, oem_number, part_number, is_featured, is_active, primary_image_url)
ON CONFLICT DO NOTHING;

-- Show how many products were inserted
DO $$
DECLARE
    product_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO product_count FROM products;
    RAISE NOTICE 'Total products in database: %', product_count;
END $$;
