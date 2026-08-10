process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const r = await c.query('SELECT * FROM storage.buckets ORDER BY id');
  console.log(JSON.stringify(r.rows, null, 2));
  const objects = await c.query("SELECT tablename, policyname, cmd, roles FROM pg_policies WHERE schemaname='storage'");
  console.log('STORAGE POLICIES:', JSON.stringify(objects.rows, null, 2));
  await c.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });