process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');

const CONNECTION = process.env.DATABASE_URL;

async function main() {
  const client = new Client({ connectionString: CONNECTION, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const grants = await client.query(
    `SELECT table_name, grantee, string_agg(privilege_type, ',' ORDER BY privilege_type) AS privs
     FROM information_schema.role_table_grants
     WHERE table_schema='public' AND grantee IN ('anon','authenticated','service_role')
     GROUP BY table_name, grantee
     ORDER BY table_name, grantee`
  );
  for (const g of grants.rows) {
    console.log(`  ${g.table_name.padEnd(22)} ${g.grantee.padEnd(14)} ${g.privs}`);
  }
  await client.end();
}

main().catch((err) => { console.error('FAILED:', err.message); process.exit(1); });