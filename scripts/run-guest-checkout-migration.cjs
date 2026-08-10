process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const CONNECTION = process.env.DATABASE_URL;

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20260809_guest_checkout.sql'), 'utf8');
  const client = new Client({ connectionString: CONNECTION, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(sql);
  console.log('GUEST_CHECKOUT_MIGRATION_OK');
  const chk = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'orders' AND column_name IN ('customer_name','customer_email') ORDER BY column_name`);
  console.log('ORDERS COLUMNS:', JSON.stringify(chk.rows));
  const fn = await client.query(`SELECT proname, prosecdef FROM pg_proc WHERE proname IN ('place_guest_order','track_order') ORDER BY proname`);
  console.log('FUNCTIONS:', JSON.stringify(fn.rows));
  await client.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });