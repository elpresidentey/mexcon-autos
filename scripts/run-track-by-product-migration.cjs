process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const CONNECTION = process.env.DATABASE_URL;

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20260813_track_by_product.sql'), 'utf8');
  const client = new Client({ connectionString: CONNECTION, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(sql);
  console.log('TRACK_BY_PRODUCT_MIGRATION_OK');
  const fn = await client.query(
    `SELECT p.proname, pg_get_functiondef(p.oid) IS NOT NULL AS defined
       FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = 'track_order_by_product'`
  );
  console.log('FUNCTION:', JSON.stringify(fn.rows));
  const grants = await client.query(
    `SELECT grantee, privilege_type FROM information_schema.role_routine_grants
      WHERE routine_name = 'track_order_by_product' AND routine_schema = 'public'
      ORDER BY grantee`
  );
  console.log('GRANTS:', JSON.stringify(grants.rows));
  await client.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });