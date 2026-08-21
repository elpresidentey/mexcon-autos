process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const CONNECTION = process.env.DATABASE_URL;

async function main() {
  const client = new Client({ connectionString: CONNECTION, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20260821_admin_notifications.sql'), 'utf8');
  await client.query(sql);
  console.log('ADMIN_NOTIFICATIONS_OK');

  const secret = await client.query(`SELECT key, value FROM app_secrets WHERE key = 'admin_notify_email'`);
  console.log('ADMIN_NOTIFY_EMAIL:', JSON.stringify(secret.rows));

  const trg = await client.query(
    `SELECT tgname FROM pg_trigger WHERE tgname IN ('trg_notify_admin_enquiry','trg_notify_admin_order') AND tgisinternal = false ORDER BY tgname`
  );
  console.log('TRIGGERS:', JSON.stringify(trg.rows));
  await client.end();
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });