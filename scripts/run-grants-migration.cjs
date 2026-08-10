process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const CONNECTION = process.env.DATABASE_URL;

async function main() {
  const client = new Client({ connectionString: CONNECTION, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('CONNECTED');
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20260808_grant_public_access.sql'), 'utf8');
  await client.query(sql);
  console.log('GRANTS_OK');
  await client.end();
}

main().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});