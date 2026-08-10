process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const fs = require('fs');
const path = require('path');
const anonKey = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];
const baseUrl = 'https://cwjhkdmsvympkdrpuyvv.supabase.co';

async function api(path_, { bearer, method = 'GET', body, headers = {} } = {}) {
  const r = await fetch(`${baseUrl}/rest/v1${path_}`, {
    method,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${bearer || anonKey}`,
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: r.status, data: await r.json() };
}

function makeEmail() { return `buyer${Date.now()}${Math.floor(Math.random() * 100)}@gmail.com`; }

(async () => {
  const email = makeEmail();
  console.log('TEST EMAIL:', email);

  // 1) register via RPC
  let r = await api('/rpc/register_customer', {
    method: 'POST',
    body: { p_email: email, p_password: 'BuyerPass123!', p_first_name: 'Ada', p_last_name: 'Okafor', p_phone: '08012345678' },
  });
  console.log('REGISTER RPC:', r.status, JSON.stringify(r.data).slice(0, 120));
  if (r.status !== 200) process.exit(1);
  const customerId = r.data;

  // 2) auth row + customer row exist
  const { Client } = require('pg');
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const us = await c.query(`SELECT email, email_confirmed_at IS NOT NULL AS confirmed FROM auth.users WHERE id = $1`, [customerId]);
  console.log('AUTH USER:', JSON.stringify(us.rows[0]));
  const cs = await c.query(`SELECT id, email, first_name FROM customers WHERE id = $1`, [customerId]);
  console.log('CUSTOMER ROW:', JSON.stringify(cs.rows[0]));

  // 3) duplicate registration rejected
  const dup = await api('/rpc/register_customer', { method: 'POST', body: { p_email: email, p_password: 'Xyz123456!' } });
  console.log('DUPLICATE REJECTED:', dup.status, JSON.stringify(dup.data).slice(0, 100));

  // 4) login with the real password -> session
  const lg = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'BuyerPass123!' }),
  });
  const lgJson = await lg.json();
  console.log('LOGIN:', lg.status, lgJson.access_token ? 'TOKEN OK' : JSON.stringify(lgJson).slice(0, 150));
  if (!lgJson.access_token) process.exit(1);
  const token = lgJson.access_token;
  const sub = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).sub;
  console.log('JWT SUB === CUSTOMER ID:', sub === customerId, sub, customerId);

  // 5) customer reads own profile via RLS
  r = await api(`/customers?select=id,email,first_name,last_name,phone&id=eq.${customerId}`, { bearer: token });
  console.log('GET OWN CUSTOMER:', r.status, JSON.stringify(r.data));
  // 7) create order, read own orders
  await c.query(`INSERT INTO orders (id, order_number, customer_id, status, payment_status, payment_method, subtotal, shipping_cost, tax_amount, discount_amount, total_amount)
    VALUES (gen_random_uuid(), 'BUYER-TEST-1', $1, 'pending', 'pending', 'pay_on_delivery', 25000, 2000, 0, 0, 27000)`, [customerId]);
  r = await api(`/orders?select=order_number,status,total_amount&customer_id=eq.${customerId}`, { bearer: token });
  console.log('CUSTOMER READS OWN ORDERS:', r.status, JSON.stringify(r.data).slice(0, 160));

  // 8) customer creates own address (new policy)
  r = await api('/customer_addresses', {
    method: 'POST',
    bearer: token,
    headers: { Prefer: 'return=representation' },
    body: { customer_id: customerId, address_type: 'both', address_line1: '12 Test Street', city: 'Lagos', state: 'Lagos', country: 'Nigeria', postal_code: '100001', is_default: true },
  });
  console.log('CREATE OWN ADDRESS:', r.status, JSON.stringify(r.data).slice(0, 160));

  // cleanup
  await c.query(`DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_id = $1)`, [customerId]);
  await c.query(`DELETE FROM orders WHERE customer_id = $1`, [customerId]);
  await c.query(`DELETE FROM customer_addresses WHERE customer_id = $1`, [customerId]);
  await c.query(`DELETE FROM customers WHERE id = $1`, [customerId]);
  await c.query(`DELETE FROM auth.users WHERE id = $1`, [customerId]);
  console.log('CLEANUP DONE');
  await c.end();
  process.exit(1); // force failure so stray check() lines don't matter
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });