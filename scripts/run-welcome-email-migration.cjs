process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const CONNECTION = process.env.DATABASE_URL;

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20260814_welcome_email.sql'), 'utf8');
  const client = new Client({ connectionString: CONNECTION, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(sql);
  console.log('WELCOME_EMAIL_MIGRATION_OK');
  const trg = await client.query(
    `SELECT tgname FROM pg_trigger WHERE tgname = 'trg_notify_customer_welcome'`
  );
  console.log('TRIGGER:', JSON.stringify(trg.rows));
  const col = await client.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'customer_id'`
  );
  console.log('EMAIL_LOGS CUSTOMER_COLUMN:', JSON.stringify(col.rows));
  const secret = await client.query(
    `SELECT count(*)::int AS n FROM app_secrets WHERE key IN ('resend_api_key','resend_from_email','app_base_url')`
  );
  console.log('SECRETS PRESENT:', secret.rows[0].n, 'of 3');
  await client.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });