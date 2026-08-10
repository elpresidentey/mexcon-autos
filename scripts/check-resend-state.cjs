process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
(async () => {
  const k = process.env.RESEND_API_KEY;
  console.log('.env key:', k);

  const d = await fetch('https://api.resend.com/domains', { headers: { Authorization: 'Bearer ' + k } });
  const dj = await d.json();
  console.log('API status:', d.status, 'domains:', JSON.stringify(dj.data || dj));

  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const r = await c.query(`SELECT value FROM app_secrets WHERE key = 'resend_api_key'`);
  console.log('DB key:', r.rows[0].value);
  const f = await c.query(`SELECT value FROM app_secrets WHERE key = 'resend_from_email'`);
  console.log('DB from:', f.rows[0].value);
  await c.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });