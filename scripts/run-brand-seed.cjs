process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase-seed-brand-additions.sql'), 'utf8');
  await c.query(sql);
  console.log('BRAND_ADDITIONS_SEED_OK');
  const r = await c.query(`
    SELECT b.name, count(p.id) AS products
    FROM brands b LEFT JOIN products p ON p.brand_id = b.id
    GROUP BY b.id, b.name ORDER BY products DESC, b.name`);
  console.log('BY BRAND:', JSON.stringify(r.rows));
  const empty = r.rows.filter((x) => Number(x.products) === 0).map((x) => x.name);
  console.log('STILL EMPTY:', empty.length ? empty.join(', ') : 'none');
  const tot = await c.query(`SELECT count(*) AS n FROM products`);
  console.log('TOTAL PRODUCTS:', tot.rows[0].n);
  await c.end();
})().catch((e) => { console.error('FAILED:', e.message, '| pos:', e.position, '|', JSON.stringify(e.detail || e.hint)); if (e.position && process.env.PRINT_SQL_AROUND) { const s = fs.readFileSync(path.join(__dirname, '..', 'supabase-seed-brand-additions.sql'), 'utf8'); const p = Number(e.position); console.log('...', s.slice(Math.max(0, p - 120), p + 80)); } process.exit(1); });