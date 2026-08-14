const fs = require('fs');
const path = require('path');
const env = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
const anonKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];
const email = env.match(/ADMIN_EMAIL=(.*)/)[1];
const password = env.match(/ADMIN_PASSWORD=(.*)/)[1];
const url = 'https://cwjhkdmsvympkdrpuyvv.supabase.co';

const buckets = ['categories', 'brands', 'banners'];

(async () => {
  const login = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!login.ok) throw new Error('LOGIN FAILED: ' + login.status + ' ' + (await login.text()));
  const { access_token } = await login.json();
  console.log('ADMIN_LOGIN_OK');

  for (const bucket of buckets) {
    const body = new FormData();
    body.append('file', new Blob(['test-image'], { type: 'image/png' }), 'test.png');
    const r = await fetch(`${url}/storage/v1/object/${bucket}/test-${Date.now()}.png`, {
      method: 'POST',
      headers: { apikey: anonKey, Authorization: `Bearer ${access_token}` },
      body,
    });
    console.log(`${bucket}: ${r.status} ${await r.text()}`);
  }
})();
