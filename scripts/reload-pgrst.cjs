process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query("NOTIFY pgrst, 'reload schema'");
  console.log('RELOAD SENT');
  await c.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });