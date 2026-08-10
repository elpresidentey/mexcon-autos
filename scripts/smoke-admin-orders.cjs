process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const CONNECTION = process.env.DATABASE_URL;
const baseUrl = 'https://cwjhkdmsvympkdrpuyvv.supabase.co';
const sbUrl = baseUrl;
const anonKey = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@mexconautos.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function main() {
  const client = new Client({ connectionString: CONNECTION, ssl: { rejectUnauthorized: false } });
  await client.connect();

  // login as admin
  const login = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const loginJson = await login.json();
  if (!loginJson.access_token) { console.error('LOGIN FAILED:', JSON.stringify(loginJson)); process.exit(1); }
  const token = loginJson.access_token;
  console.log('ADMIN LOGIN OK');

  // test product insert as admin
  // pick a real category and brand for the insert
  const catRes = await client.query(`SELECT id FROM categories WHERE is_active = true LIMIT 1`);
  const catId = catRes.rows[0] && catRes.rows[0].id;
  const brandRes = await client.query(`SELECT id FROM brands WHERE is_active = true LIMIT 1`);
  const brandId = brandRes.rows[0] && brandRes.rows[0].id;
  console.log('TEST CATEGORY:', catId, 'BRAND:', brandId);

  const names = [
    { name: 'Smoke Test Brake Pad', category_id: catId, brand_id: brandId, price: 25000, oem_number: 'ST-001', part_number: 'ST-001', is_active: true, is_featured: false },
  ];
  const prod = await fetch(`${sbUrl}/rest/v1/products`, {
    method: 'POST',
    headers: { apikey: anonKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(names[0]),
  });
  const prodBody = await prod.json();
  console.log('ADMIN CREATE PRODUCT:', prod.status, JSON.stringify(prodBody).slice(0, 120));

  const productId = prodBody[0]?.id;

  // insert a test order via service role SQL (pooler as postgres)
  const ins = await client.query(`INSERT INTO orders (order_number, customer_id, status, payment_status, payment_method, subtotal, shipping_cost, tax_amount, discount_amount, total_amount)
    VALUES ('SMOKE-TEST-1', NULL, 'pending', 'pending', 'bank_transfer', 25000, 2000, 0, 0, 27000) RETURNING id`);
  const orderId = ins.rows[0].id;
  console.log('TEST ORDER INSERTED:', orderId);

  // admin list orders (page query used by OrdersPage)
  const list = await fetch(`${sbUrl}/rest/v1/orders?select=*,customer:customers(*),items:order_items(*)&order=created_at.desc&limit=10`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
  });
  console.log('ADMIN LIST ORDERS:', list.status, JSON.stringify((await list.json())).slice(0, 120));

  // admin approve (update status)
  const upd = await fetch(`${sbUrl}/rest/v1/orders?id=eq.${orderId}`, {
    method: 'PATCH',
    headers: { apikey: anonKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ status: 'confirmed' }),
  });
  console.log('ADMIN APPROVE ORDER:', upd.status, JSON.stringify((await upd.json())).slice(0, 120));

  // cleanup
  await client.query(`DELETE FROM orders WHERE id = $1`, [orderId]);
  if (productId) await fetch(`${sbUrl}/rest/v1/products?id=eq.${productId}`, { method: 'DELETE', headers: { apikey: anonKey, Authorization: `Bearer ${token}` } });
  console.log('CLEANUP DONE');
  await client.end();
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });