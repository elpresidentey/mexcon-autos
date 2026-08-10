process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const r = await c.query(`SELECT au.*, ai.id AS identity_id
    FROM auth.users au LEFT JOIN auth.identities ai ON ai.user_id = au.id
    WHERE au.email = 'admin@mexconautos.com' OR au.email = 'mvpbuyer1786250753648@gmail.com'
    ORDER BY au.created_at`);
  for (const row of r.rows) {
    console.log('=== ' + row.email + ' ===');
    console.log(JSON.stringify(row, null, 1));
  }
  await c.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });