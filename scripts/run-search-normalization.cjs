process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

process.loadEnvFile(path.join(__dirname, '..', '.env'));

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20260810_search_normalization.sql'), 'utf8');
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query(sql);
  console.log('SEARCH_NORMALIZATION_MIGRATION_OK');

  const cols = await c.query(`SELECT column_name, is_generated FROM information_schema.columns WHERE table_name = 'products' AND column_name IN ('oem_number_clean','part_number_clean')`);
  console.log('GENERATED COLS:', JSON.stringify(cols.rows));

  const idx = await c.query(`SELECT indexname FROM pg_indexes WHERE tablename = 'products' AND indexname LIKE '%_trgm' ORDER BY indexname`);
  console.log('TRGM INDEXES:', JSON.stringify(idx.rows.map(r => r.indexname)));

  const pasted = await c.query(`SELECT count(*) AS n FROM products WHERE oem_number_clean ILIKE '%4851007010%' OR part_number_clean ILIKE '%4851007010%'`);
  console.log('PASS-THROUGH: oem 4851007010 ->', pasted.rows[0].n);

  const sample = await c.query(`SELECT oem_number, oem_number_clean, part_number, part_number_clean FROM products WHERE oem_number = '48510-07010' LIMIT 1`);
  console.log('SAMPLE ROW:', JSON.stringify(sample.rows[0]));

  await c.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });