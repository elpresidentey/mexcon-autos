process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
// Full order lifecycle smoke against live Supabase:
// anon places guest order -> admin logs in -> admin sees order in list ->
// admin updates status to confirmed + marks paid -> guest re-tracks and
// sees the updated state -> registered-customer path is covered by
// smoke-checkout.cjs. Everything is cleaned up at the end.

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const CONNECTION = process.env.DATABASE_URL;
if (!supabaseUrl || !anonKey) throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');

async function api(path_, { method = 'GET', body, headers = {} } = {}) {
  const r = await fetch(`${supabaseUrl}/rest/v1${path_}`, {
    method,
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { status: r.status, data };
}

function assert(name, cond, extra) {
  const detail = extra === undefined ? '' : JSON.stringify(extra).slice(0, 300);
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`, cond ? '' : detail);
  if (!cond) process.exitCode = 1;
}

(async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@mexconautos.com';
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) throw new Error('Set ADMIN_PASSWORD env var');

  const email = `flow.${Date.now()}@example.com`;

  // 1. anon picks an active product
  let r = await api('/products?select=id,name,price,part_number&is_active=eq.true&limit=1');
  assert('anon reads product', r.status === 200 && r.data?.length === 1, r);
  const product = r.data[0];
  const subtotal = Number(product.price) * 2;

  // 2. guest places a pay-on-delivery order
  r = await api('/rpc/place_guest_order', {
    method: 'POST',
    body: {
      p_items: [{ product_id: product.id, product_name: product.name, product_sku: product.part_number, quantity: 2, unit_price: Number(product.price), total_price: subtotal }],
      p_payment_method: 'pay_on_delivery',
      p_subtotal: subtotal,
      p_shipping_cost: 2000,
      p_tax_amount: 0,
      p_discount_amount: 0,
      p_total_amount: subtotal + 2000,
      p_shipping_address_line1: '12 Admiralty Way',
      p_shipping_address_line2: '',
      p_shipping_city: 'Lekki',
      p_shipping_state: 'Lagos',
      p_shipping_postal_code: '106104',
      p_shipping_country: 'Nigeria',
      p_shipping_phone: '08022223333',
      p_customer_name: 'Flow Test Buyer',
      p_customer_email: email,
      p_customer_notes: 'Live flow test',
    },
  });
  assert('guest order placed', r.status === 200 && typeof r.data?.order_number === 'string', r);
  const orderNumber = r.data.order_number;

  // 3. admin login
  console.log('\n[admin login]');
  const loginRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });
  const login = await loginRes.json();
  const adminToken = login.access_token;
  assert('admin login succeeds', !!adminToken, login);
  if (!adminToken) process.exit(1);

  // 4. admin sees the new order in the orders list (RLS-backed query, same as app)
  r = await api(`/orders?select=*,items:order_items(*),customer:customers(*)&order_number=eq.${orderNumber}`, { headers: { Authorization: `Bearer ${adminToken}` } });
  const order = r.data?.[0];
  assert('admin sees guest order', r.status === 200 && order && order.order_number === orderNumber, r);
  assert('order has guest email snapshot', order?.customer_email === email, order);
  assert('order items snapshot correct', order?.items?.length === 1 && order.items[0].product_name === product.name && order.items[0].quantity === 2, order?.items);
  assert('totals correct', Number(order?.total_amount) === subtotal + 2000 && Number(order?.shipping_cost) === 2000, order);
  assert('state starts pending', order?.status === 'pending' && order?.payment_status === 'pending', order);

  // 5. admin updates status to confirmed (same PATCH the admin app sends)
  r = await api(`/orders?id=eq.${order.id}`, {
    method: 'PATCH',
    body: { status: 'confirmed' },
    headers: { Authorization: `Bearer ${adminToken}`, Prefer: 'return=representation' },
  });
  assert('admin confirms order', r.status === 200 && r.data?.[0]?.status === 'confirmed', r);

  // 6. admin marks payment paid (as with gateway / manual)
  r = await api(`/orders?id=eq.${order.id}`, {
    method: 'PATCH',
    body: { payment_status: 'paid', payment_reference: 'LIVE-FLOW-TEST-001' },
    headers: { Authorization: `Bearer ${adminToken}`, Prefer: 'return=representation' },
  });
  assert('admin marks paid', r.status === 200 && r.data?.[0]?.payment_status === 'paid', r);

  // 7. admin ships it
  r = await api(`/orders?id=eq.${order.id}`, {
    method: 'PATCH',
    body: { status: 'shipped', shipped_at: new Date().toISOString() },
    headers: { Authorization: `Bearer ${adminToken}`, Prefer: 'return=representation' },
  });
  assert('admin ships order', r.status === 200 && r.data?.[0]?.status === 'shipped', r);

  // 8. guest re-tracks: sees updated status + payment
  r = await api(`/rpc/track_order?p_order_number=${orderNumber}&p_email=${encodeURIComponent(email)}`);
  assert(
    'guest sees updated state',
    r.status === 200 && r.data?.status === 'shipped' && r.data?.payment_status === 'paid',
    r
  );

  // 9. wrong email still rejected even after updates
  r = await api(`/rpc/track_order?p_order_number=${orderNumber}&p_email=someoneelse%40example.com`);
  assert('wrong email still rejected', r.status === 200 && r.data === null, r);

  // 10. cleanup: delete order + items directly (test data only)
  const c = new Client({ connectionString: CONNECTION, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query('DELETE FROM order_items WHERE order_id = $1', [order.id]);
  await c.query('DELETE FROM orders WHERE id = $1', [order.id]);
  await c.end();
  console.log('CLEANUP DONE');

  process.exit(process.exitCode || 0);
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });