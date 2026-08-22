process.loadEnvFile(require('path').join(__dirname, '..', '.env'));

(async () => {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  const { data: login } = await supabase.auth.signInWithPassword({
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });
  const token = login.session.access_token;
  const headers = { apikey: process.env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` };

  console.log('--- products root listing ---');
  let r = await fetch(`${process.env.VITE_SUPABASE_URL}/storage/v1/object/list/products`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix: '', limit: 100 }),
  });
  console.log('status', r.status);
  const root = await r.json();
  for (const o of root.slice(0, 10)) {
    console.log(JSON.stringify({ name: o.name, id: o.id ? 'file' : 'folder', size: o.metadata?.size }));
  }

  console.log('--- products/products listing ---');
  r = await fetch(`${process.env.VITE_SUPABASE_URL}/storage/v1/object/list/products`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix: 'products', limit: 20 }),
  });
  const lvl2 = await r.json();
  for (const o of lvl2.slice(0, 10)) {
    console.log(JSON.stringify({ name: o.name, id: o.id ? 'file' : 'folder', size: o.metadata?.size }));
  }

  console.log('--- download one categories file ---');
  r = await fetch(`${process.env.VITE_SUPABASE_URL}/storage/v1/object/public/categories/1787150776019-hg6mmf.jpg`);
  console.log('public dl status', r.status, r.headers.get('content-type'), r.headers.get('content-length'));
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });