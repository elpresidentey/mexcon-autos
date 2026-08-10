-- Simple Product Seed - Uses first available category and brand IDs
-- Run this if the other seed file fails

-- Insert products using the first available category and brand IDs
INSERT INTO products (name, category_id, brand_id, price, description, oem_number, part_number, is_featured, is_active, primary_image_url)
SELECT 
    p.name,
    (SELECT id FROM categories LIMIT 1),
    (SELECT id FROM brands LIMIT 1),
    p.price,
    p.description,
    p.oem_number,
    p.part_number,
    p.is_featured,
    p.is_active,
    p.primary_image_url
FROM (VALUES
('Toyota Camry 2.5L Timing Belt Kit', 45000.00, 'Complete timing belt kit including belt, tensioner, and idler pulleys for Toyota Camry 2.5L engine', '13568-09010', 'TK-TOY-CAM-25', true, true, '/car-engine.webp'),
('Honda Accord 2.4L Oil Filter', 3500.00, 'High-quality oil filter for Honda Accord 2.4L engine', '15400-PLM-A01', 'OF-HON-ACC-24', true, true, '/car-engine.webp'),
('Nissan Altima 2.5L Air Filter', 4500.00, 'Premium air filter for Nissan Altima 2.5L engine', '16546-0J000', 'AF-NIS-ALT-25', false, true, '/car-engine.webp'),
('Hyundai Elantra 1.8L Spark Plugs (Set of 4)', 12000.00, 'Iridium spark plugs set for Hyundai Elantra 1.8L engine', '18855-10060', 'SP-HYU-ELN-18', false, true, '/car-engine.webp'),
('Toyota Camry Front Brake Pads (Set)', 18000.00, 'Ceramic front brake pads for Toyota Camry', '04465-07010', 'BP-TOY-CAM-F', true, true, '/brake-system.webp'),
('Honda Accord Rear Brake Discs (Pair)', 35000.00, 'Vented rear brake discs for Honda Accord', '42510-TR0-A00', 'BD-HON-ACC-R', true, true, '/brake-system.webp'),
('Nissan Altima Brake Caliper (Front Left)', 45000.00, 'Remanufactured front left brake caliper for Nissan Altima', '44010-5Y000', 'BC-NIS-ALT-FL', false, true, '/brake-system.webp'),
('Toyota Camry Front Shock Absorbers (Pair)', 55000.00, 'Gas-charged front shock absorbers for Toyota Camry', '48510-07010', 'SA-TOY-CAM-F', true, true, '/wesley-tingey-2fTXCO4Cz1A-unsplash.webp'),
('Honda Accord Rear Strut Assembly (Pair)', 65000.00, 'Complete rear strut assemblies for Honda Accord', '52602-TVA-A01', 'RS-HON-ACC-R', false, true, '/wesley-tingey-2fTXCO4Cz1A-unsplash.webp'),
('Toyota Camry Automatic Transmission Fluid', 8500.00, 'Genuine Toyota ATF WS transmission fluid (4L)', '00279-ATFWS', 'TF-TOY-ATFWS', true, true, '/transmission.webp'),
('Honda Accord CVT Fluid', 9500.00, 'Honda HCF-2 CVT fluid (4L)', '08200-9007', 'TF-HON-CVT', false, true, '/transmission.webp'),
('Toyota Camry Power Steering Pump', 75000.00, 'Remanufactured power steering pump for Toyota Camry', '44350-07010', 'PSP-TOY-CAM', true, true, '/steering-pumps.webp'),
('Honda Accord Steering Rack', 85000.00, 'Remanufactured steering rack for Honda Accord', '53600-TVA-A01', 'SR-HON-ACC', false, true, '/steering-pumps.webp'),
('Toyota Camry Alternator', 95000.00, 'Remanufactured alternator for Toyota Camry 2.5L', '27060-07010', 'ALT-TOY-CAM', true, true, '/car-engine.webp'),
('Honda Accord Starter Motor', 85000.00, 'Remanufactured starter for Honda Accord 2.4L', '31200-RBB-004', 'STM-HON-ACC', false, true, '/car-engine.webp'),
('Toyota Camry Radiator', 65000.00, 'Aluminum radiator for Toyota Camry 2.5L', '16400-07010', 'RAD-TOY-CAM', true, true, '/car-engine.webp'),
('Honda Accord Water Pump', 15000.00, 'Water pump for Honda Accord 2.4L', '19200-RBB-004', 'WP-HON-ACC', false, true, '/car-engine.webp'),
('Toyota 5W-30 Synthetic Engine Oil (5L)', 12000.00, 'Genuine Toyota 5W-30 synthetic motor oil', '08880-82380', 'EO-TOY-5W30', true, true, '/car-engine.webp'),
('Honda 0W-20 Synthetic Oil (5L)', 13000.00, 'Honda Genuine 0W-20 synthetic motor oil', '08798-9033', 'EO-HON-0W20', false, true, '/car-engine.webp'),
('Toyota Camry Oil Filter', 3500.00, 'OEM oil filter for Toyota Camry', '04152-YZZA1', 'OF-TOY-CAM', true, true, '/car-engine.webp'),
('Honda Accord Cabin Air Filter', 4000.00, 'Cabin air filter for Honda Accord', '80292-TVA-A01', 'CAF-HON-ACC', false, true, '/car-engine.webp'),
('Toyota Camry Front Bumper', 85000.00, 'OEM front bumper for Toyota Camry', '52119-07010', 'FB-TOY-CAM', true, true, '/car-engine.webp'),
('Honda Accord Left Fender', 75000.00, 'OEM left front fender for Honda Accord', '60211-TVA-A00', 'LF-HON-ACC', false, true, '/car-engine.webp'),
('Toyota Camry Headlight Assembly (Left)', 55000.00, 'OEM left headlight assembly for Toyota Camry', '81150-07010', 'HL-TOY-CAM-L', true, true, '/brake-system.webp'),
('Honda Accord LED Tail Light (Left)', 65000.00, 'OEM LED tail light for Honda Accord', '33551-TVA-A01', 'TL-HON-ACC-L', false, true, '/brake-system.webp'),
('Toyota Camry Fuel Pump', 45000.00, 'Electric fuel pump for Toyota Camry', '23217-07010', 'FP-TOY-CAM', true, true, '/car-engine.webp'),
('Honda Accord Fuel Injector (Set of 4)', 55000.00, 'Set of 4 fuel injectors for Honda Accord', '16450-RBB-A01', 'FI-HON-ACC-4', false, true, '/car-engine.webp')
) AS p(name, price, description, oem_number, part_number, is_featured, is_active, primary_image_url)
ON CONFLICT DO NOTHING;
