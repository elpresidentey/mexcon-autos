process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const r = await c.query(`SELECT au.email, ai.provider, ai.identity_data->>'email' AS ident_email
    FROM auth.users au LEFT JOIN auth.identities ai ON ai.user_id = au.id
    WHERE au.email = 'admin@mexconautos.com' OR au.email LIKE 'buyer%'`);
  console.log('IDENTITIES:', JSON.stringify(r.rows, null, 2));
  await c.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });