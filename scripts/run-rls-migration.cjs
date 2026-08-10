process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const CONN = process.env.DATABASE_URL;

async function main() {
  const client = new Client({ connectionString: CONN, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('CONNECTED');
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20260808_rls_admin_security.sql'), 'utf8');
  await client.query(sql);
  console.log('MIGRATION_OK');
  const { rows } = await client.query(
    `SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname`
  );
  for (const r of rows) console.log(`${r.tablename}: ${r.policyname}`);
  await client.end();
}

main().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});