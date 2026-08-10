process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');

const CONNECTION = process.env.DATABASE_URL;

async function main() {
  const client = new Client({ connectionString: CONNECTION, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const t = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`
  );
  console.log('TABLES:', t.rows.map((r) => r.table_name).join(', '));
  const e = await client.query(
    `SELECT typname FROM pg_type WHERE typname IN ('order_status','payment_status','payment_method','address_type')`
  );
  console.log('ENUMS:', e.rows.map((r) => r.typname).join(', '));
  await client.end();
}

main().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});