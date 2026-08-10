process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const r = await c.query(`
    SELECT policyname, tablename, cmd, roles, qual, with_check
    FROM pg_policies
    WHERE tablename IN ('orders','order_items','cart_items')
    ORDER BY tablename, policyname`);
  for (const row of r.rows) {
    console.log(`[${row.tablename}] ${row.policyname} (${row.cmd} roles=${row.roles})`);
    console.log('  USING:', row.qual);
    console.log('  CHECK:', row.with_check);
  }
  await c.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });