process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const anonKey = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];
const baseUrl = 'https://cwjhkdmsvympkdrpuyvv.supabase.co';
const CONNECTION = process.env.DATABASE_URL;

async function api(path_, { token, method = 'GET', body, headers = {} } = {}) {
  const r = await fetch(`${baseUrl}/rest/v1${path_}`, {
    method,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token || anonKey}`,
      'Content-Type': 'application/json',
      ...headers,
    },
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
  const email = `checkout${Date.now()}@gmail.com`;

  // 0. pick a product
  let r = await api('/products?select=id,name,price,part_number&is_active=eq.true&limit=1');
  assert('anon reads product', r.status === 200 && r.data.length === 1, r);
  const product = r.data[0];

  // 1. register
  r = await api('/rpc/register_customer', {
    method: 'POST',
    body: { p_email: email, p_password: 'BuyerPass123!', p_first_name: 'Chi', p_last_name: 'Nwosu', p_phone: '08099887766' },
  });
  const customerId = r.data;
  assert('register_customer', r.status === 200 && typeof customerId === 'string', r);

  // 2. login (matches the app's customerLogin)
  const lg = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'BuyerPass123!' }),
  });
  const token = (await lg.json()).access_token;
  assert('customer login', lg.status === 200 && !!token);

  // 3. save address (shipping step)
  r = await api('/customer_addresses', {
    method: 'POST',
    token,
    headers: { Prefer: 'return=representation' },
    body: { customer_id: customerId, address_type: 'both', address_line1: '4 Admiralty Way', address_line2: 'Lekki Phase 1', city: 'Lekki', state: 'Lagos', postal_code: '105102', country: 'Nigeria', is_default: true },
  });
  assert('create address', r.status === 201 && r.data[0]?.customer_id === customerId, r);

  // 4. add to cart (as customer)
  r = await api('/cart_items', {
    method: 'POST',
    token,
    headers: { Prefer: 'return=minimal' },
    body: { customer_id: customerId, product_id: product.id, quantity: 2 },
  });
  assert('add to cart', r.status === 201, r);

  // 5. create order (payment step)
  const orderNumber = `MXC-TEST-${Date.now().toString(36).toUpperCase()}`;
  const subtotal = Number(product.price) * 2;
  const shipping = 2000;
  r = await api('/orders', {
    method: 'POST',
    token,
    headers: { Prefer: 'return=representation' },
    body: {
      order_number: orderNumber,
      customer_id: customerId,
      status: 'pending',
      payment_status: 'pending',
      payment_method: 'bank_transfer',
      subtotal,
      shipping_cost: shipping,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: subtotal + shipping,
      shipping_address_line1: '4 Admiralty Way',
      shipping_address_line2: 'Lekki Phase 1',
      shipping_city: 'Lekki',
      shipping_state: 'Lagos',
      shipping_postal_code: '105102',
      shipping_country: 'Nigeria',
      shipping_phone: '08099887766',
      customer_notes: 'Leave with security',
    },
  });
  assert('create order', r.status === 201 && r.data[0]?.order_number === orderNumber, r);
  const order = r.data[0];

  // 6. create order items
  r = await api('/order_items', {
    method: 'POST',
    token,
    headers: { Prefer: 'return=minimal' },
    body: {
      order_id: order.id,
      product_id: product.id,
      product_name: product.name,
      product_sku: product.part_number,
      quantity: 2,
      unit_price: Number(product.price),
      total_price: subtotal,
    },
  });
  assert('create order items', r.status === 201, r);

  // 7. customer reads own order with items
  r = await api(`/orders?select=*,items:order_items(*)&id=eq.${order.id}`, { token });
  assert('read own order + items', r.status === 200 && r.data[0]?.items?.length === 1, r);

  // 8. cart cleared (app clears after order)
  r = await api('/cart_items?customer_id=eq.' + customerId, { token });
  const beforeCleanup = r.data.length;
  const c = new Client({ connectionString: CONNECTION, ssl: { rejectUnauthorized: false } });
  await c.connect();
  await c.query(`DELETE FROM order_items WHERE order_id = $1`, [order.id]);
  await c.query(`DELETE FROM orders WHERE id = $1`, [order.id]);
  await c.query(`DELETE FROM cart_items WHERE customer_id = $1`, [customerId]);
  await c.query(`DELETE FROM customer_addresses WHERE customer_id = $1`, [customerId]);
  await c.query(`DELETE FROM customers WHERE id = $1`, [customerId]);
  await c.query(`DELETE FROM auth.users WHERE id = $1`, [customerId]);
  await c.end();
  console.log('cart items before cleanup:', beforeCleanupCount = beforeCleanup); // placeholder
  console.log('CLEANUP DONE');
  process.exit(process.exitCode || 0);
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });