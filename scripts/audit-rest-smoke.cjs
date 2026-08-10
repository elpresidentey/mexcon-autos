process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
(async () => {
  const base = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  const h = { apikey: key, Authorization: 'Bearer ' + key };
  const get = async (label, url) => {
    const r = await fetch(base + url, { headers: h });
    const j = await r.json();
    const ok = r.status === 200;
    const size = Array.isArray(j) ? j.length : (j && j.length !== undefined ? j.length : JSON.stringify(j).slice(0, 80));
    console.log((ok ? 'OK  ' : 'FAIL') + ' ' + label + ' -> status ' + r.status + ' rows ' + (Array.isArray(j) ? size : 'obj'));
    return j;
  };
  const post = async (label, path, body) => {
    const r = await fetch(base + path, { method: 'POST', headers: { ...h, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json();
    console.log((r.status === 200 ? 'OK  ' : 'FAIL') + ' ' + label + ' -> status ' + r.status);
    return j;
  };

  await get('products+embeds', '/rest/v1/products?select=*,category:categories(*),brand:brands(*),images:product_images(*)&is_active=eq.true&limit=3');
  await get('categories', '/rest/v1/categories?select=*&is_active=eq.true');
  await get('brands', '/rest/v1/brands?select=*');
  await get('banners', '/rest/v1/homepage_banners?select=*&active=eq.true&order=display_order');
  await get('settings', '/rest/v1/platform_settings?limit=1');
  const q = await post('search(corolla)', '/rest/v1/rpc/search_products', { p_search: 'corolla' });
  console.log('  corolla total:', q[0].total);
  const p = await post('search 2013', '/rest/v1/rpc/search_products', { p_year: '2013' });
  console.log('  year2013 total:', p[0].total);
  const inc = await post('increment view', '/rest/v1/rpc/increment_product_view', { product_id: 'toyota-camry' });
  console.log('  (expected bad uuid ->', typeof inc === 'object' ? JSON.stringify(inc).slice(0, 60) : inc, ')');
})().catch((e) => console.error('FAILED', e.message));