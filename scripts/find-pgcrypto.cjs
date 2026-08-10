process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const r = await c.query(`
    SELECT n.nspname, p.proname
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname IN ('crypt','gen_salt') ORDER BY 1,2`);
  console.log('PGCRYPTO FOUND IN:', JSON.stringify(r.rows, null, 2));
  await c.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });