process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();

  const tables = ['products', 'brands', 'categories', 'product_images', 'customers', 'customer_addresses',
    'orders', 'order_items', 'cart_items', 'enquiries', 'enquiry_images', 'platform_settings',
    'admin_users', 'audit_logs', 'homepage_banners', 'email_logs', 'app_secrets'];
  const t = await c.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`);
  const have = new Set(t.rows.map((r) => r.tablename));
  const missing = tables.filter((x) => !have.has(x));
  console.log('MISSING TABLES:', missing.length ? missing.join(', ') : 'none');

  const rls = await c.query(`SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public' AND tablename = ANY($1)`, [tables]);
  const noRls = rls.rows.filter((r) => !r.rowsecurity).map((r) => r.tablename);
  console.log('TABLES WITHOUT RLS:', noRls.length ? noRls.join(', ') : 'none');

  const rpcs = ['register_customer', 'place_guest_order', 'track_order', 'search_products', 'increment_product_view', 'submit_enquiry', 'is_admin'];
  const f = await c.query(`SELECT p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = ANY($1)`, [rpcs]);
  const fHave = new Set(f.rows.map((r) => r.proname));
  const fMissing = rpcs.filter((x) => !fHave.has(x));
  console.log('MISSING RPCs:', fMissing.length ? fMissing.join(', ') : 'none');

  const cols = await c.query(`
    SELECT table_name, string_agg(column_name, ',' ORDER BY column_name) AS cols
    FROM information_schema.columns WHERE table_schema = 'public' GROUP BY table_name`);
  const colMap = Object.fromEntries(cols.rows.map((r) => [r.table_name, r.cols.split(',')]));
  const need = {
    products: ['primary_image_url', 'compatible_models', 'oem_number', 'part_number', 'is_featured', 'is_active', 'view_count', 'slug', 'price', 'stock_quantity'],
    orders: ['order_number', 'total_amount', 'payment_status', 'payment_method', 'status', 'tracking_code', 'email', 'shipping_address'],
    cart_items: ['quantity', 'product_id', 'customer_id', 'session_id'],
    enquiries: ['status', 'product_id', 'customer_email', 'customer_name'],
    product_images: ['image_url', 'product_id', 'is_primary'],
    categories: ['slug', 'name', 'description'],
    brands: ['slug', 'name'],
    customers: ['email', 'first_name', 'last_name', 'phone'],
    platform_settings: ['company_name', 'contact_email', 'whatsapp_number', 'seo_title'],
  };
  const badCols = [];
  for (const [tbl, colsNeeded] of Object.entries(need)) {
    for (const col of colsNeeded) {
      if (!(colMap[tbl] || []).includes(col)) badCols.push(`${tbl}.${col}`);
    }
  }
  console.log('MISSING COLUMNS:', badCols.length ? badCols.join(', ') : 'none');

  const trig = await c.query(`
    SELECT tgname, pg_get_triggerdef(oid) AS def FROM pg_trigger
    WHERE tgrelid = 'orders'::regclass AND NOT tgisinternal`);
  console.log('ORDERS TRIGGERS:', trig.rows.length ? trig.rows.map((r) => r.tgname).join(', ') : 'NONE!');

  const secrets = await c.query(`SELECT key FROM app_secrets ORDER BY key`);
  console.log('APP_SECRETS KEYS:', secrets.rows.map((r) => r.key).join(', '));

  const em = await c.query(`SELECT status, count(*) FROM email_logs GROUP BY status`);
  console.log('EMAIL_LOGS:', JSON.stringify(em.rows));

  const px = await c.query(`SELECT count(*) FILTER (WHERE is_active) AS active, count(*) AS total FROM products`);
  console.log('PRODUCTS:', JSON.stringify(px.rows[0]));

  await c.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });