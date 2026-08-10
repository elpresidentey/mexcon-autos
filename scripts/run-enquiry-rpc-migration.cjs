process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const CONNECTION = process.env.DATABASE_URL;

async function main() {
  const client = new Client({ connectionString: CONNECTION, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20260808_enquiry_submit_rpc.sql'), 'utf8');
  await client.query(sql);
  console.log('RPC_MIGRATION_OK');

  const verify = await client.query(
    `SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
     FROM pg_proc p
     WHERE p.proname = 'submit_enquiry'
       AND pg_function_is_visible(p.oid)`
  );
  console.log('FUNCTIONS:', JSON.stringify(verify.rows, null, 2));

  const grants = await client.query(`
    SELECT grantee, privilege_type FROM information_schema.role_routine_grants
    WHERE routine_name = 'submit_enquiry' AND routine_schema = 'public'
    ORDER BY grantee, privilege_type
  `);
  console.log('GRANTS:', JSON.stringify(grants.rows, null, 2));

  await client.end();
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });