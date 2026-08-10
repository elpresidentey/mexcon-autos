process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query(`UPDATE app_secrets SET value = $1 WHERE key = 'resend_api_key'`, [process.env.RESEND_API_KEY]);
  console.log('KEY UPDATED IN app_secrets');
  const r = await c.query(`SELECT key, left(value, 24) AS head FROM app_secrets WHERE key LIKE 'resend%'`);
  console.log(JSON.stringify(r.rows));
  await c.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });