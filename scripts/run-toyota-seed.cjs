process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
const path = require('path');
process.loadEnvFile(path.join(__dirname, '..', '.env'));
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();

  const d = await c.query(`
    DELETE FROM products p
    USING products dup
    WHERE p.name = dup.name AND p.id > dup.id
  `);
  console.log('DUPLICATES DELETED:', d.rowCount);

  const before = await c.query(`SELECT count(*) AS n FROM products`);
  console.log('TOTAL PRODUCTS:', before.rows[0].n);

  const tok = await c.query(`SELECT count(*) AS n FROM products WHERE name ILIKE '%corolla%'`);
  console.log('COROLLA:', tok.rows[0].n);

  const idx = await c.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_products_name_unique ON products (lower(name));
  `);
  console.log('UNIQUE INDEX ON NAME OK');

  const dup = await c.query(`SELECT count(*) AS n FROM (SELECT lower(name) FROM products GROUP BY lower(name) HAVING count(*) > 1) t`);
  console.log('REMAINING NAME DUPES:', dup.rows[0].n);
  await c.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });