// End-to-end smoke test against live Supabase REST API.
// Covers exactly what the app does: admin login, product create/read,
// anon browsing, quote (enquiry) submission, admin inbox.

// Load .env (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, ADMIN_PASSWORD)
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !anonKey) throw new Error('Missing SUPABASE_URL / SUPABASE_ANON_KEY (or VITE_* in .env)');

const base = (path, { token, method = 'GET', body } = {}) =>
  fetch(`${supabaseUrl}/rest/v1${path}`, {
    method,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token || anonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

const jget = async (path, token) => {
  const r = await base(path, { token });
  const j = await r.json();
  return { status: r.status, data: j };
};
const jpost = async (path, token, body) => {
  const r = await base(path, { token, method: 'POST', body });
  const j = await r.json();
  return { status: r.status, data: j };
};

let pass = 0;
let fail = 0;
const check = (label, ok, detail = '') => {
  if (ok) {
    pass++;
    console.log('  PASS', label);
  } else {
    fail++;
    console.log('  FAIL', label, detail.slice ? detail.slice(0, 200) : detail);
  }
};

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@mexconautos.com';
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error('Set ADMIN_PASSWORD env var');

  // ---- 1. Admin login ----
  console.log('\n[1] Admin login');
  const loginRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const login = await loginRes.json();
  const adminToken = login.access_token;
  check('admin login succeeds', !!adminToken, JSON.stringify(login).slice(0, 200));
  if (!adminToken) {
    console.log(`\nFINAL: ${pass} pass, ${fail} fail`);
    process.exit(fail === 0 ? 0 : 1);
  }
  console.log('  logged in as', login.user.email, `(${login.user.role})`);

  // ---- 2. Admin reads products ----
  console.log('\n[2] Admin reads products');
  let r = await jget(`/products?select=id,name&limit=3`, adminToken);
  check('products list returns rows', r.status === 200 && Array.isArray(r.data) && r.data.length > 0, `${r.status} ${JSON.stringify(r.data)}`);
  const productId = r.data && r.data[0] && r.data[0].id;

  // ---- 3. Admin reads enquiries inbox ----
  console.log('\n[3] Admin reads enquiries');
  r = await jget(`/enquiries?select=*&limit=3`, adminToken);
  check('enquiries readable', r.status === 200 && Array.isArray(r.data), `${r.status} ${JSON.stringify(r.data).slice(0,200)}`);

  // ---- 4. Admin reads platform settings ----
  console.log('\n[4] Admin reads platform settings');
  r = await jget(`/platform_settings?select=*`, adminToken);
  check('settings readable', r.status === 200 && Array.isArray(r.data), `${r.status} ${JSON.stringify(r.data).slice(0,200)}`);

  // ---- 5. Anonymous visitor browses active products ----
  console.log('\n[5] Anonymous reads active products');
  r = await jget(`/products?select=*&is_active=eq.true&limit=5`);
  check('anon sees products', r.status === 200 && Array.isArray(r.data) && r.data.length > 0, `${r.status} ${JSON.stringify(r.data).slice(0,200)}`);

  // ---- 6. Anonymous submits a quote request (enquiry) via SECURITY DEFINER RPC ----
  console.log('\n[6] Anonymous submits quote request');
  const enquiryBody = {
    customer_name: 'Smoke Test User',
    customer_email: 'smoke-test@example.com',
    customer_phone: '08000000000',
    vehicle_details: 'Toyota Camry 2017',
    message: 'Smoke test part request',
  };
  r = await jpost(`/rpc/submit_enquiry`, '', enquiryBody);
  const enquiryId = r.data && r.data.id;
  check('enquiry created via rpc', r.status === 200 && enquiryId, `${r.status} ${JSON.stringify(r.data).slice(0,200)}`);

  // ---- 7. Admin sees the new enquiry in inbox ----
  if (enquiryId) {
    console.log('\n[7] Admin sees the new enquiry');
    r = await jget(`/enquiries?select=id,customer_name,status,is_read&id=eq.${enquiryId}`, adminToken);
    check('enquiry visible to admin', r.status === 200 && r.data.length === 1, `${r.status} ${JSON.stringify(r.data)}`);

    // cleanup: admin deletes test enquiry (Prefer: return=representation -> 200 + body)
    const del = await base(`/enquiries?id=eq.${enquiryId}`, { token: adminToken, method: 'DELETE' });
    const delBody = await del.json();
    check('admin can delete enquiry (cleanup)', del.status === 200 && (delBody || []).length === 1, `${del.status} ${JSON.stringify(delBody).slice(0,200)}`);
  }

  // ---- 8. Admin updates a product (does not change data, touches updated_at only via view_count) ----
  console.log('\n[8] Admin PATCHes a product');
  if (productId) {
    const up = await jget(`/products?select=view_count&id=eq.${productId}`, adminToken);
    const vc = up.data && up.data[0] && up.data[0].view_count;
    const PATCH = await base(`/products?id=eq.${productId}`, { token: adminToken, method: 'PATCH', body: { view_count: vc } });
    check('admin can PATCH product', PATCH.status === 200, `${PATCH.status}`);
  } else {
    check('admin can PATCH product', false, 'no product id from [2]');
  }

  // ---- Final ----
  console.log(`\nFINAL: ${pass} pass, ${fail} fail`);
  process.exit(fail === 0 ? 0 : 1);
}
main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });