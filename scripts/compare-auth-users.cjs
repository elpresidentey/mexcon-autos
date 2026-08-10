process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const r = await c.query(`SELECT email, instance_id, aud, role, email_confirmed_at, confirmation_token,
    recovery_token, email_change, email_change_token_new, banned_until, deleted_at, is_sso_user,
    (encrypted_password IS NOT NULL) AS has_pw
    FROM auth.users WHERE email = 'admin@mexconautos.com' OR email LIKE 'buyer%' ORDER BY created_at DESC`);
  console.log(JSON.stringify(r.rows, null, 2));
  const cols = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='auth' AND table_name='users' ORDER BY ordinal_position`);
  console.log('AUTH USER COLUMNS:', cols.rows.map(x => x.column_name).join(', '));
  await c.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });