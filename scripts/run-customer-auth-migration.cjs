process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const CONNECTION = process.env.DATABASE_URL;

async function main() {
  const client = new Client({ connectionString: CONNECTION, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20260808_customer_auth.sql'), 'utf8');
  await client.query(sql);
  console.log('CUSTOMER_AUTH_MIGRATION_OK');

  const fn = await client.query(`
    SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args, p.prosecdef
    FROM pg_proc p WHERE p.proname = 'register_customer' AND pg_function_is_visible(p.oid)
  `);
  console.log('FUNCTION:', JSON.stringify(fn.rows, null, 2));

  const pols = await client.query(`SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'customer_addresses'`);
  console.log('ADDRESS POLICIES:', JSON.stringify(pols.rows, null, 2));

  await client.end();
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });