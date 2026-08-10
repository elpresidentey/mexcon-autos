process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

process.loadEnvFile(path.join(__dirname, '..', '.env'));
const CONNECTION = process.env.DATABASE_URL;

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20260810_order_emails.sql'), 'utf8');
  const client = new Client({ connectionString: CONNECTION, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(sql);
  console.log('ORDER_EMAILS_MIGRATION_OK');

  const tbl = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('app_secrets','email_logs') ORDER BY table_name`);
  console.log('TABLES:', JSON.stringify(tbl.rows.map(r => r.table_name)));

  const ext = await client.query(`SELECT installed_version FROM pg_available_extensions WHERE name = 'pg_net'`);
  console.log('PG_NET INSTALLED:', JSON.stringify(ext.rows));

  const trg = await client.query(`SELECT tgname FROM pg_trigger WHERE tgname = 'trg_notify_order_placed'`);
  console.log('TRIGGER:', JSON.stringify(trg.rows));

  const secrets = await client.query(`SELECT key FROM app_secrets ORDER BY key`);
  console.log('SECRET KEYS (no values):', JSON.stringify(secrets.rows.map(r => r.key)));

  await client.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });