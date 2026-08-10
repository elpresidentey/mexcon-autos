process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const CONNECTION = process.env.DATABASE_URL;
const supabaseUrl = 'https://cwjhkdmsvympkdrpuyvv.supabase.co';
const anonKey = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];

async function main() {
  const client = new Client({ connectionString: CONNECTION, ssl: { rejectUnauthorized: false } });
  await client.connect();

  // 1) Create missing storage buckets (idempotent)
  const buckets = ['products', 'brands', 'categories', 'enquiries', 'banners'];
  for (const b of buckets) {
    await client.query(`INSERT INTO storage.buckets (id, name, public) VALUES ($1, $1, true) ON CONFLICT (id) DO UPDATE SET public = true`, [b]);
    console.log('BUCKET OK:', b);
  }

  // 2) Storage object RLS: admins manage product/brand/category media
  await client.query(`DROP POLICY IF EXISTS "Admins can manage product media" ON storage.objects`);
  await client.query(`
    CREATE POLICY "Admins can manage product media" ON storage.objects FOR ALL
      TO public USING (bucket_id = 'products' AND public.is_admin())
      WITH CHECK (bucket_id = 'products' AND public.is_admin());
  `);

  // 3) Enquiry bucket: public can upload, admins can manage
  await client.query(`DROP POLICY IF EXISTS "Public can upload enquiry images" ON storage.objects`);
  await client.query(`
    CREATE POLICY "Public can upload enquiry images" ON storage.objects FOR INSERT
      TO anon, authenticated WITH CHECK (bucket_id = 'enquiries');
  `);

  // 4) order_items: customers must be able to INSERT their order rows
  await client.query(`DROP POLICY IF EXISTS "Customers can insert own order items" ON public.order_items`);
  await client.query(`
    CREATE POLICY "Customers can insert own order items"
      ON public.order_items FOR INSERT
      TO public
      WITH CHECK (order_id IN (
        SELECT o.id FROM public.orders o
        WHERE o.customer_id IN (
          SELECT c.id FROM public.customers c WHERE c.auth_id = auth.uid()
        )
      ));
  `);

  // 5) order_items update for own orders (customers)
  await client.query(`DROP POLICY IF EXISTS "Customers can update own order items" ON public.order_items`);
  await client.query(`
    CREATE POLICY "Customers can update own order items"
      ON public.order_items FOR UPDATE
      TO public
      USING (order_id IN (
        SELECT o.id FROM public.orders o
        WHERE o.customer_id IN (SELECT c.id FROM public.customers c WHERE c.auth_id = auth.uid())
      ));
  `);

  await client.end();
  console.log('SQL_FIXES_OK');

  const r2 = await fetch(`${supabaseUrl}/storage/v1/bucket`, { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } });
  console.log('BUCKETS NOW:', r2.status, JSON.stringify(await r2.json()));
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });