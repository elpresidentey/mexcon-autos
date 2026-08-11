-- Starter catalogue for brands that had zero products (customer-facing BrandsPage was showing empty brand pages).
-- Safe to re-run: unique index on lower(name) makes duplicate inserts fail silently.
INSERT INTO products (name, description, oem_number, part_number, price, brand_id, category_id, primary_image_url, engine_type, compatible_models, is_active, is_featured, created_at, updated_at)
SELECT v.name, v.description, v.oem_number, v.part_number, v.price,
       b.id AS brand_id, c.id AS category_id, v.primary_image_url, v.engine_type, v.compatible_models,
       TRUE, FALSE, now(), now()
FROM (VALUES
  -- ===== Kia =====
  ('Kia Sportage Front Brake Pads (Set)', 'Genuine replacement front brake pads for Kia Sportage. Ceramic compound, low dust.', '58101-1FA00', 'BP-KIA-SPO-F', 18500.00, '/brake-system.webp', '2.0L G4GC', ARRAY['Kia Sportage','Kia Sportage 2010','Kia Sportage 2013','Kia Sportage 2016','2.0L G4GC','2.4L G4KE']),
  ('Kia Rio Oil Filter', 'OEM-grade oil filter for Kia Rio petrol engines.', '26300-35503', 'OF-KIA-RIO', 4500.00, '/car-engine.webp', '1.4L G4EE', ARRAY['Kia Rio','Kia Rio 2010','Kia Rio 2013','1.4L G4EE','1.6L G4FC']),
  ('Kia Sportage Spark Plugs (Set of 4)', 'Iridium spark plug set for Kia Sportage. OE 18855-10060 equivalent.', '18855-10060', 'SP-KIA-SPO', 14500.00, '/car-engine.webp', '2.0L G4GC', ARRAY['Kia Sportage','Kia Sportage 2013','Kia Sportage 2016','2.0L G4GC','2.4L G4KE']),
  ('Kia Sportage Front Shock Absorber', 'Front shock absorber for Kia Sportage with factory valving.', '54660-2S500', 'SH-KIA-SPO-F', 52000.00, '/suspension.webp', '2.0L G4GC', ARRAY['Kia Sportage','Kia Sportage 2010','Kia Sportage 2013','2.0L G4GC']),
  -- ===== Mazda =====
  ('Mazda 3 Front Brake Pads (Set)', 'Front brake pad set for Mazda 3. Semi-metallic, smooth bite.', '1Y08-33-23Z', 'BP-MAZ-M3-F', 16500.00, '/brake-system.webp', '2.0L LF', ARRAY['Mazda 3','Mazda 3 2008','Mazda 3 2011','2.0L LF','2.3L L3']),
  ('Mazda 6 Oil Filter', 'High-efficiency oil filter for Mazda 6 (2.0/2.3/2.5L).', '1WPE-14-302', 'OF-MAZ-M6', 4200.00, '/car-engine.webp', '2.5L PY', ARRAY['Mazda 6','Mazda 6 2009','Mazda 6 2012','2.0L L8','2.5L PY']),
  ('Mazda 3 Ignition Coil', 'Direct-fit ignition coil for Mazda 3. Replaces OE 1E01-18-100.', '1E01-18-100', 'IC-MAZ-M3', 18500.00, '/car-engine.webp', '2.0L LF', ARRAY['Mazda 3','Mazda 3 2008','Mazda 3 2011','2.0L LF']),
  ('Mazda 6 Radiator', 'All-aluminium radiator for Mazda 6. Core tested, ready to install.', '1WPE-15-200', 'RD-MAZ-M6', 62000.00, '/car-engine.webp', '2.5L PY', ARRAY['Mazda 6','Mazda 6 2009','Mazda 6 2012','2.5L PY']),
  -- ===== Mitsubishi =====
  ('Mitsubishi Lancer Front Brake Pads (Set)', 'Front brake pads for Mitsubishi Lancer (CS/CY). R90 rated.', 'MR389816', 'BP-MIT-LAN-F', 15000.00, '/brake-system.webp', '2.0L 4B11', ARRAY['Mitsubishi Lancer','Lancer 2008','Lancer 2012','1.6L 4G18','2.0L 4B11']),
  ('Mitsubishi Pajero Oil Filter', 'Oil filter for Pajero diesel engines (4M40/4M41).', 'MD360935', 'OF-MIT-PAJ', 4800.00, '/car-engine.webp', '3.2L 4M41 Diesel', ARRAY['Mitsubishi Pajero','Pajero 2008','Pajero 2012','2.8L 4M40 Diesel','3.2L 4M41 Diesel']),
  ('Mitsubishi Lancer Spark Plugs (Set of 4)', 'Spark plug set for Mitsubishi Lancer 1.6/2.0L.', 'MD355636', 'SP-MIT-LAN', 13200.00, '/car-engine.webp', '1.6L 4G18', ARRAY['Mitsubishi Lancer','Lancer 2008','Lancer 2012','1.6L 4G18','2.0L 4B11']),
  ('Mitsubishi Pajero Radiator (Diesel)', 'Heavy-duty radiator for Pajero 4M40/4M41 diesel.', 'MR483700', 'RD-MIT-PAJ', 78000.00, '/car-engine.webp', '3.2L 4M41 Diesel', ARRAY['Mitsubishi Pajero','Pajero 2008','Pajero 2012','2.8L 4M40 Diesel','3.2L 4M41 Diesel']),
  -- ===== Subaru =====
  ('Subaru Impreza Front Brake Pads (Set)', 'Front brake pad set for Subaru Impreza (GD/GE).', '26296FE040', 'BP-SUB-IMP-F', 17500.00, '/brake-system.webp', '2.0L EJ20', ARRAY['Subaru Impreza','Impreza 2006','Impreza 2010','2.0L EJ20','2.5L EJ25']),
  ('Subaru Forester Oil Filter', 'Genuine-spec oil filter for Subaru Forester boxer engines.', '15208AA100', 'OF-SUB-FOR', 4500.00, '/car-engine.webp', '2.5L FB25', ARRAY['Subaru Forester','Forester 2009','Forester 2013','2.0L EJ20','2.5L FB25']),
  ('Subaru Impreza Front Shock Absorber', 'Front strut assembly for Subaru Impreza.', '20310FE410', 'SH-SUB-IMP-F', 56000.00, '/suspension.webp', '2.0L EJ20', ARRAY['Subaru Impreza','Impreza 2006','Impreza 2010','2.0L EJ20']),
  ('Subaru Forester Headlight Assembly (Left)', 'Complete left headlight assembly for Subaru Forester (SG/SH).', '84001SG010', 'HL-SUB-FOR-L', 43000.00, '/hero-2.webp', '2.5L FB25', ARRAY['Subaru Forester','Forester 2009','Forester 2013']),
  -- ===== Suzuki =====
  ('Suzuki Swift Front Brake Pads (Set)', 'Front brake pads for Suzuki Swift (ZC/ZY). Low noise formulation.', '55200-63J62', 'BP-SUZ-SWI-F', 14200.00, '/brake-system.webp', '1.4L K14B', ARRAY['Suzuki Swift','Swift 2011','Swift 2014','1.3L M13A','1.5L M15A']),
  ('Suzuki Swift Oil Filter', 'Oil filter for Suzuki Swift petrol engines.', '16510-61A03', 'OF-SUZ-SWI', 3200.00, '/car-engine.webp', '1.4L K14B', ARRAY['Suzuki Swift','Swift 2011','Swift 2014','1.3L M13A']),
  ('Suzuki Vitara Spark Plugs (Set of 4)', 'Iridium spark plugs for Suzuki Vitara 1.6L.', '99000-78K08', 'SP-SUZ-VIT', 12000.00, '/car-engine.webp', '1.6L M16A', ARRAY['Suzuki Vitara','Vitara 2011','Vitara 2015','1.6L M16A','1.4L K14C Turbo']),
  ('Suzuki Jimny Front Shock Absorber', 'Front shock absorber for Suzuki Jimny. Fits 1998-2018.', '41601-76A00', 'SH-SUZ-JIM-F', 36000.00, '/suspension.webp', '1.3L M13A', ARRAY['Suzuki Jimny','Jimny 2008','Jimny 2012','1.3L M13A']),
  -- ===== Isuzu =====
  ('Isuzu D-Max Front Brake Pads (Set)', 'Front brake pads for Isuzu D-Max. Heavy-duty compound.', '8971882000', 'BP-ISU-DMX-F', 19800.00, '/brake-system.webp', '3.0L 4JJ1 Diesel', ARRAY['Isuzu D-Max','D-Max 2012','D-Max 2016','2.5L 4JA1 Diesel','3.0L 4JJ1 Diesel']),
  ('Isuzu D-Max Oil Filter', 'Oil filter for Isuzu D-Max 4JA1/4JJ1 diesel engines.', '8943323471', 'OF-ISU-DMX', 6500.00, '/car-engine.webp', '3.0L 4JJ1 Diesel', ARRAY['Isuzu D-Max','D-Max 2012','D-Max 2016','2.5L 4JA1 Diesel','3.0L 4JJ1 Diesel']),
  ('Isuzu MU-X Air Filter', 'Panel air filter for Isuzu MU-X / D-Max diesel.', '8943321220', 'AF-ISU-MUX', 9800.00, '/car-engine.webp', '3.0L 4JJ1 Diesel', ARRAY['Isuzu D-Max','D-Max 2016','3.0L 4JJ1 Diesel']),
  ('Isuzu D-Max Fuel Filter (Diesel)', 'Diesel fuel filter with water separator for D-Max.', '8975812390', 'FF-ISU-DMX', 12500.00, '/car-engine.webp', '3.0L 4JJ1 Diesel', ARRAY['Isuzu D-Max','D-Max 2012','D-Max 2016','2.5L 4JA1 Diesel','3.0L 4JJ1 Diesel']),
  -- ===== Acura =====
  ('Acura MDX Front Brake Pads (Set)', 'Front brake pads for Acura MDX. Premium ceramic.', '45022-S3V-A00', 'BP-ACU-MDX-F', 26000.00, '/brake-system.webp', '3.7L J37A1', ARRAY['Acura MDX','MDX 2007','MDX 2010','3.7L J37A1']),
  ('Acura TLX Oil Filter', 'Oil filter for Acura TLX 2.4/3.5L.', '15400-PLM-A02', 'OF-ACU-TLX', 6800.00, '/car-engine.webp', '2.4L K24W', ARRAY['Acura TLX','TLX 2015','TLX 2018','2.4L K24W']),
  ('Acura TLX Spark Plugs (Set of 4)', 'Spark plug set for Acura TLX 2.4L.', '12290-5A2-A01', 'SP-ACU-TLX', 16800.00, '/car-engine.webp', '2.4L K24W', ARRAY['Acura TLX','TLX 2015','TLX 2018']),
  ('Acura MDX Transmission Filter Kit', 'Transmission filter and gasket kit for Acura MDX.', '28400-RGL-A01', 'TF-ACU-MDX', 14500.00, '/transmission.webp', '3.7L J37A1', ARRAY['Acura MDX','MDX 2007','MDX 2010']),
  -- ===== Lexus =====
  ('Lexus RX350 Front Brake Pads (Set)', 'Front brake pads for Lexus RX350. OEM-grade, low dust.', '04465-48140', 'BP-LEX-RX-F', 28500.00, '/brake-system.webp', '2.5L 2AR-FXE', ARRAY['Lexus RX350','RX350 2010','RX350 2013','RX350 2016']),
  ('Lexus ES350 Oil Filter', 'Genuine-spec oil filter for Lexus ES350 2GR-FE.', '90915-YZZD3', 'OF-LEX-ES', 7200.00, '/car-engine.webp', '3.5L 2GR-FE', ARRAY['Lexus ES350','ES350 2010','ES350 2013']),
  ('Lexus RX350 Cabin Air Filter', 'Cabin air filter for Lexus RX350. Activated carbon.', '87139-0E030', 'CF-LEX-RX', 11000.00, '/car-engine.webp', '2.5L 2AR-FXE', ARRAY['Lexus RX350','RX350 2010','RX350 2013']),
  ('Lexus RX350 Water Pump', 'Water pump with gasket for Lexus RX350 2GR-FE.', '16100-29065', 'WP-LEX-RX', 68000.00, '/car-engine.webp', '3.5L 2GR-FE', ARRAY['Lexus RX350','RX350 2010','RX350 2013']),
  -- ===== Infiniti =====
  ('Infiniti Q50 Front Brake Pads (Set)', 'Front brake pads for Infiniti Q50. Ceramic compound.', '40206-4GA0B', 'BP-ISN-Q50-F', 24000.00, '/brake-system.webp', '3.7L VQ37VHR', ARRAY['Infiniti Q50','Q50 2014','Q50 2017','3.7L VQ37VHR']),
  ('Infiniti FX35 Oil Filter', 'Oil filter for Infiniti FX35 VQ35HR.', '15208-65F0A', 'OF-ISN-FX', 5800.00, '/car-engine.webp', '3.5L VQ35HR', ARRAY['Infiniti FX35','FX35 2008','FX35 2012','3.5L VQ35HR']),
  ('Infiniti Q50 Spark Plugs (Set of 4)', 'Iridium spark plugs for Infiniti Q50 3.7L.', '22401-1MC1C', 'SP-ISN-Q50', 16500.00, '/car-engine.webp', '3.7L VQ37VHR', ARRAY['Infiniti Q50','Q50 2014','Q50 2017']),
  ('Infiniti Q50 Alternator', 'Remanufactured alternator for Infiniti Q50 3.7L.', '23100-2NE0B', 'ALT-ISN-Q50', 98000.00, '/car-engine.webp', '3.7L VQ37VHR', ARRAY['Infiniti Q50','Q50 2014','Q50 2017']),
  -- ===== KG Mobility (SsangYong) =====
  ('SsangYong Rexton Front Brake Pads (Set)', 'Front brake pads for SsangYong Rexton. Heavy-duty diesel fit.', '46154-64000', 'BP-SSY-REX-F', 19000.00, '/brake-system.webp', '2.2L D22DTR Diesel', ARRAY['SsangYong Rexton','Rexton 2012','Rexton 2014','2.7L D27DT Diesel','2.2L D22DTR Diesel']),
  ('SsangYong Korando Oil Filter', 'Oil filter for SsangYong Korando 2.0 diesel.', '107200-3450', 'OF-SSY-KOR', 4800.00, '/car-engine.webp', '2.0L D20DTF Diesel', ARRAY['SsangYong Korando','Korando 2014','Korando 2017','2.0L D20DTF Diesel']),
  ('SsangYong Rexton Air Filter', 'Panel air filter for SsangYong Rexton 2.2/2.7 diesel.', '800401-1700', 'AF-SSY-REX', 9500.00, '/car-engine.webp', '2.2L D22DTR Diesel', ARRAY['SsangYong Rexton','Rexton 2012','Rexton 2014','2.2L D22DTR Diesel']),
  ('SsangYong Korando Fuel Filter (Diesel)', 'Diesel fuel filter for SsangYong Korando.', '800152-1100', 'FF-SSY-KOR', 13800.00, '/car-engine.webp', '2.0L D20DTF Diesel', ARRAY['SsangYong Korando','Korando 2014','Korando 2017'])
) AS v(name, description, oem_number, part_number, price, primary_image_url, engine_type, compatible_models)
JOIN brands b ON b.slug = CASE
  WHEN left(v.name, 3) = 'Kia' THEN 'kia'
  WHEN v.name LIKE 'Mazda%' THEN 'mazda'
  WHEN v.name LIKE 'Mitsubishi%' THEN 'mitsubishi'
  WHEN v.name LIKE 'Subaru%' THEN 'subaru'
  WHEN v.name LIKE 'Suzuki%' THEN 'suzuki'
  WHEN v.name LIKE 'Isuzu%' THEN 'isuzu'
  WHEN v.name LIKE 'Acura%' THEN 'acura'
  WHEN v.name LIKE 'Lexus%' THEN 'lexus'
  WHEN v.name LIKE 'Infiniti%' THEN 'infiniti'
  WHEN v.name LIKE 'SsangYong%' THEN 'kg-mobility'
END
JOIN categories c ON c.slug = CASE
  WHEN v.name ILIKE '%brake%' THEN 'brake-system'
  WHEN v.name ILIKE '%oil filter%' THEN 'oil-filter'
  WHEN v.name ILIKE '%air filter%' THEN 'air-filters'
  WHEN v.name ILIKE '%spark%' THEN 'spark-plugs'
  WHEN v.name ILIKE '%shock%' THEN 'suspension'
  WHEN v.name ILIKE '%headlight%' THEN 'lighting'
  WHEN v.name ILIKE '%radiator%' OR v.name ILIKE '%water pump%' THEN 'cooling-system'
  WHEN v.name ILIKE '%transmission%' THEN 'transmission'
  WHEN v.name ILIKE '%fuel filter%' THEN 'fuel-system'
  WHEN v.name ILIKE '%alternator%' OR v.name ILIKE '%ignition coil%' THEN 'electrical-components'
  ELSE 'engine-components'
END
ON CONFLICT DO NOTHING;