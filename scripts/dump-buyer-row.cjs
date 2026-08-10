process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const anonKey = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];
const baseUrl = 'https://cwjhkdmsvympkdrpuyvv.supabase.co';

(async () => {
  const email = `diffbuyer${Date.now()}@gmail.com`;
  const r = await fetch(`${baseUrl}/rest/v1/rpc/register_customer`, {
    method: 'POST',
    headers: { apikey: anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_email: email, p_password: 'BuyerPass123!', p_first_name: 'X', p_last_name: 'Y' }),
  });
  const uid = (await r.json());
  console.log('UID:', uid);

  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const res = await c.query(`SELECT * FROM auth.users WHERE id = $1`, [uid]);
  console.log('BUYER ROW:', JSON.stringify(res.rows[0], null, 1));

  // Try login
  const lg = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'BuyerPass123!' }),
  });
  console.log('LOGIN:', lg.status, JSON.stringify(await lg.json()).slice(0, 200));

  // cleanup
  await c.query(`DELETE FROM customers WHERE id = $1`, [uid]);
  await c.query(`DELETE FROM auth.users WHERE id = $1`, [uid]);
  await c.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });