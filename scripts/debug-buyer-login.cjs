process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const fs = require('fs');
const path = require('path');
const anonKey = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];
const baseUrl = 'https://cwjhkdmsvympkdrpuyvv.supabase.co';

async function api(path_, { bearer, method = 'GET', body } = {}) {
  const r = await fetch(`${baseUrl}/rest/v1${path_}`, {
    method,
    headers: { apikey: anonKey, Authorization: `Bearer ${bearer || anonKey}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: r.status, data: await r.json() };
}

async function tryLogin(email, password) {
  const lg = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const j = await lg.json();
  console.log(`LOGIN ${email}:`, lg.status, j.access_token ? 'TOKEN OK' : JSON.stringify(j));
  return lg.status;
}

(async () => {
  // cleanup previous test user + create fresh
  const connected = (await import('pg')).default;
  const { Client } = require('pg');
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();

  const email = `mvpbuyer${Date.now()}@gmail.com`;
  let r = await api('/rpc/register_customer', { method: 'POST', body: { p_email: email, p_password: 'BuyerPass123!', p_first_name: 'Tola', p_last_name: 'Bello' } });
  console.log('REGISTER:', r.status, JSON.stringify(r.data).slice(0, 80));
  const uid = r.data;

  console.log('--- login attempt 1 (immediate) ---');
  let s = await tryLogin(email, 'BuyerPass123!');

  await new Promise((res) => setTimeout(res, 5000));
  console.log('--- login attempt 2 (after 5s) ---');
  s = await tryLogin(email, 'BuyerPass123!');

  // Compare: does ADMIN still login? (control)
  console.log('--- admin control login ---');
  await tryLogin('admin@mexconautos.com', process.env.ADMIN_TEST_PASSWORD || 'CHANGE_ME');

  // What does auth.users row look like vs signup-created users?
  const au = await c.query(`SELECT email, confirmation_sent_at, confirmation_token, recovery_token, email_change, is_sso_user, deleted_at
    FROM auth.users WHERE id = $1`, [uid]);
  console.log('FRESH ROW:', JSON.stringify(au.rows[0]));

  // cleanup
  await c.query(`DELETE FROM customers WHERE id = $1`, [uid]);
  await c.query(`DELETE FROM auth.users WHERE id = $1`, [uid]);
  await c.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });