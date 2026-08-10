process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

process.loadEnvFile(path.join(__dirname, '..', '.env'));

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20260810_search_products_rpc.sql'), 'utf8');
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query(sql);
  console.log('SEARCH_RPC_MIGRATION_OK');
  const r = await c.query(`SELECT p.proname, pg_get_function_arguments(p.oid) AS args FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = 'search_products'`);
  console.log('FUNCTION:', JSON.stringify(r.rows[0]));
  const g = await c.query(`SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name = 'search_products' UNION ALL SELECT grantee, privilege_type FROM information_schema.routine_privileges WHERE routine_name = 'search_products'`);
  console.log('GRANTS:', JSON.stringify(g.rows));
  await c.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });