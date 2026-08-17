process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const CONNECTION = process.env.DATABASE_URL;

async function main() {
  const client = new Client({ connectionString: CONNECTION, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20260817_receipt_system.sql'), 'utf8');
  await client.query(sql);
  console.log('RECEIPT_SYSTEM_OK');

  const cols = await client.query(
    `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name IN ('receipt_path','receipt_url','payment_verified_at','payment_verified_by','payment_note') ORDER BY column_name`
  );
  console.log('ORDERS_COLUMNS:', JSON.stringify(cols.rows.map((r) => r.column_name)));

  const buckets = await client.query(`SELECT id FROM storage.buckets WHERE id = 'receipts'`);
  console.log('BUCKET_EXISTS:', buckets.rows.length === 1);

  const pols = await client.query(
    `SELECT policyname, cmd FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname ILIKE '%receipt%' ORDER BY policyname`
  );
  console.log('RECEIPT_POLICIES:', JSON.stringify(pols.rows));

  const trg = await client.query(`SELECT tgname FROM pg_trigger WHERE tgname = 'trg_notify_payment_verified'`);
  console.log('PAYMENT_TRIGGER:', JSON.stringify(trg.rows));

  await client.end();
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
