process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const anonKey = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];
const baseUrl = 'https://cwjhkdmsvympkdrpuyvv.supabase.co';
const CONNECTION = process.env.DATABASE_URL;

async function api(path_, { method = 'GET', body, headers = {} } = {}) {
  const r = await fetch(`${baseUrl}/rest/v1${path_}`, {
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
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`, cond ? '' : JSON.stringify(extra));
  if (!cond) process.exitCode = 1;
}

(async () => {
  // pick a product
  let r = await api('/products?select=id,name,price,part_number&is_active=eq.true&limit=1');
  assert('anon reads product', r.status === 200 && r.data.length === 1, r);
  const product = r.data[0];
  const subtotal = Number(product.price) * 1;

  // guest places an order (anon! no token)
  r = await api('/rpc/place_guest_order', {
    method: 'POST',
    body: {
      p_items: [{ product_id: product.id, product_name: product.name, product_sku: product.part_number, quantity: 1, unit_price: Number(product.price), total_price: subtotal }],
      p_payment_method: 'bank_transfer',
      p_subtotal: subtotal,
      p_shipping_cost: 2000,
      p_tax_amount: 0,
      p_discount_amount: 0,
      p_total_amount: subtotal + 2000,
      p_shipping_address_line1: '9B Awolowo Rd',
      p_shipping_address_line2: '',
      p_shipping_city: 'Ikoyi',
      p_shipping_state: 'Lagos',
      p_shipping_postal_code: '101233',
      p_shipping_country: 'Nigeria',
      p_shipping_phone: '08011112222',
      p_customer_name: 'Guest Buyer',
      p_customer_email: 'guest.buyer@gmail.com',
      p_customer_notes: 'Call before delivery',
    },
  });
  assert('guest order placed', r.status === 200 && typeof r.data?.order_number === 'string', r);
  const orderNumber = r.data.order_number;

  // guest tracks it with order number + email
  r = await api(`/rpc/track_order?p_order_number=${orderNumber}&p_email=guest.buyer%40gmail.com`);
  assert('guest tracks own order', r.status === 200 && r.data?.order_number === orderNumber && r.data?.items?.length === 1, r);

  // wrong email must NOT be able to track it
  r = await api(`/rpc/track_order?p_order_number=${orderNumber}&p_email=other%40gmail.com`);
  assert('wrong email rejected', r.status === 200 && r.data === null, r);

  // cleanup
  const c = new Client({ connectionString: CONNECTION, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const id = (await c.query(`SELECT id FROM orders WHERE order_number = $1`, [orderNumber])).rows[0]?.id;
  if (id) {
    await c.query(`DELETE FROM order_items WHERE order_id = $1`, [id]);
    await c.query(`DELETE FROM orders WHERE id = $1`, [id]);
  }
  await c.end();
  console.log('CLEANUP DONE');
  process.exit(process.exitCode || 0);
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });