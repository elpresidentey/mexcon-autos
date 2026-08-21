process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  await client.query(fs_sql());
  function fs_sql() {
    return require('fs').readFileSync(require('path').join(__dirname, '..', 'supabase', 'migrations', '20260821_receipts_private.sql'), 'utf8');
  }

  const b = await client.query(`SELECT id, public FROM storage.buckets WHERE id = 'receipts'`);
  console.log('RECEIPTS_BUCKET:', JSON.stringify(b.rows));
  if (b.rows[0]?.public !== false) throw new Error('Bucket is still public!');

  // Confirm a sample receipt path exists so we know legacy rows are intact
  const sample = await client.query(`SELECT receipt_path FROM orders WHERE receipt_path IS NOT NULL LIMIT 1`);
  console.log('LEGACY_RECEIPT_ROWS:', sample.rowCount);

  await client.end();
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });