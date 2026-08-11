process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const r = await c.query(`
    SELECT b.name, b.slug, count(p.id) AS products
    FROM brands b LEFT JOIN products p ON p.brand_id = b.id
    GROUP BY b.id, b.name, b.slug ORDER BY products DESC, b.name`);
  console.log('BRANDS:', JSON.stringify(r.rows, null, 1));
  const cats = await c.query(`SELECT slug, name FROM categories ORDER BY name`);
  console.log('CATEGORIES:', JSON.stringify(cats.rows));
  const sample = await c.query(`SELECT name, oem_number, part_number, price, primary_image_url FROM products WHERE brand_id = (SELECT id FROM brands WHERE slug='honda') LIMIT 2`);
  console.log('SAMPLE HONDA:', JSON.stringify(sample.rows));
  await c.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });