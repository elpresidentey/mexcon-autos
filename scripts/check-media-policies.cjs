process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const r = await c.query(`SELECT policyname, cmd, roles, qual, with_check
     FROM pg_policies WHERE tablename IN ('enquiry_images','enquiries','media_gallery') ORDER BY tablename`);
  console.log(JSON.stringify(r.rows, null, 2));
  await c.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });