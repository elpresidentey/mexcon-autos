process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');

const CONNECTION = process.env.DATABASE_URL;

async function main() {
  const client = new Client({ connectionString: CONNECTION, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const p = await client.query(
    `SELECT policyname, cmd, roles, qual, with_check FROM pg_policies
     WHERE schemaname = 'public' AND tablename = 'enquiries'`
  );
  console.log('POLICIES:', JSON.stringify(p.rows, null, 2));

  const r = await client.query(
    `SELECT relname, relrowsecurity, relforcerowsecurity FROM pg_class WHERE relname = 'enquiries'`
  );
  console.log('RLS:', JSON.stringify(r.rows));

  const g = await client.query(
    `SELECT grantee, privilege_type FROM information_schema.role_table_grants
     WHERE table_schema='public' AND table_name='enquiries' AND grantee IN ('anon','authenticated')`
  );
  console.log('GRANTS:', JSON.stringify(g.rows, null, 2));

  await client.end();
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });