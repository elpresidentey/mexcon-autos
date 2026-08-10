process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const supabaseUrl = 'https://cwjhkdmsvympkdrpuyvv.supabase.co';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
if (!anonKey) { console.error('VITE_SUPABASE_ANON_KEY missing in .env'); process.exit(1); }

async function main() {
  // 1. Plain products query (count + 3 rows), like the app
  const url1 = `${supabaseUrl}/rest/v1/products?select=*%2Ccategory:categories(*)%2Cbrand:brands(*)%2Cimages:product_images(*)&is_active=eq.true&order=created_at.desc&limit=3`;
  const r1 = await fetch(url1, { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } });
  console.log('EMBEDDED QUERY STATUS:', r1.status);
  const j1 = await r1.json();
  console.log('EMBEDDED ROWS:', Array.isArray(j1) ? j1.length : JSON.stringify(j1).slice(0, 400));

  // 2. Check each embedded relation anon visibility
  for (const table of ['categories', 'brands', 'product_images']) {
    const url = `${supabaseUrl}/rest/v1/${table}?select=*&limit=1`;
    const r = await fetch(url, { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } });
    console.log(`${table}:`, r.status, (await r.json()).length ?? JSON.stringify(await r.json()).slice(0, 200));
  }
}
main().catch((e) => { console.error(e.message); process.exit(1); });