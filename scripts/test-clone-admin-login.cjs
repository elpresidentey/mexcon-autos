process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const anonKey = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];
const baseUrl = 'https://cwjhkdmsvympkdrpuyvv.supabase.co';

(async () => {
  const email = `cloneadmin${Date.now()}@gmail.com`;
  const uuid = crypto.randomUUID();
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();

  // EXACT copy of the reset-admin insert (the one that logs in fine)
  await c.query(
    `INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
     VALUES ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', $2,
             extensions.crypt($3, extensions.gen_salt('bf')), now(), now(), now(),
             '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, '', '', '', '')`,
    [uuid, email, 'BuyerPass123!']
  );

  const lg = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'BuyerPass123!' }),
  });
  console.log('CLONE-ADMIN LOGIN:', lg.status, JSON.stringify(await lg.json()).slice(0, 180));

  await c.query(`DELETE FROM auth.users WHERE id = $1`, [uuid]);
  await c.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });