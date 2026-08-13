/**
 * Bulk product image uploader.
 *
 * Drop images into  scripts/bulk-images/  organized by product so this script
 * can find them. Matching key is chosen automatically per file: first the
 * product's PART NUMBER, then OEM number, then a name fragment.
 *
 * Layout options (by part number is recommended):
 *   scripts/bulk-images/BP-MAZ-M3-F/001.jpg
 *   scripts/bulk-images/BP-MAZ-M3-F/002.webp
 *   scripts/bulk-images/1Y08-33-23Z.jpg        (filename = OEM number)
 *
 * Each image is uploaded to storage (products/<id>/...), registered in
 * product_images, and the first image becomes primary (primary_image_id and
 * primary_image_url updated).
 *
 * Usage:
 *   node scripts/bulk-upload-images.cjs --dry    (default: plan only)
 *   node scripts/bulk-upload-images.cjs --apply   (upload for real)
 */
process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const fs = require('fs');
const path = require('path');

const EXT_RE = /\.(jpe?g|png|webp)$/i;

(async () => {
  const apply = process.argv.includes('--apply');
  const base = process.env.VITE_SUPABASE_URL;
  const anon = process.env.VITE_SUPABASE_ANON_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@mexconautos.com';
  const adminPassword = process.env.ADMIN_PASSWORD;
  const dir = path.join(__dirname, 'bulk-images');

  if (!adminPassword) {
    console.error('Set ADMIN_PASSWORD in .env (or env) to log in as admin.');
    process.exit(1);
  }

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created ${dir} — drop product images here and re-run.`);
    console.log('See scripts/bulk-images/README.txt for layout.');
    return;
  }

  // --- login as admin
  const login = await fetch(base + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { apikey: anon, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });
  const token = (await login.json()).access_token;
  if (!token) { console.error('Admin login failed — check credentials'); process.exit(1); }
  const A = { apikey: anon, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };

  // --- all products (id, part_number, oem_number, name)
  const all = await (await fetch(base + '/rest/v1/products?select=id,part_number,oem_number,name', { headers: A })).json();
  const byPart = new Map(all.map((p) => [String(p.part_number || '').toLowerCase(), p]));
  const byOem = new Map(all.map((p) => [String(p.oem_number || '').toLowerCase(), p]));

  const matchProduct = (fragment) => {
    const key = fragment.toLowerCase();
    return byPart.get(key) || byOem.get(key) || all.find((p) => p.name.toLowerCase().includes(key));
  };

  // --- discover images
  const jobs = []; // { product, files: [] }
  const unmatched = [];
  const dirs = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of dirs) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const files = fs.readdirSync(full).filter((f) => EXT_RE.test(f)).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
      if (files.length === 0) { unmatched.push(entry.name + '/ (empty folder)'); continue; }
      const product = matchProduct(entry.name);
      if (!product) { unmatched.push(entry.name + '/ (no product match)'); continue; }
      jobs.push({ product, files: files.map((f) => path.join(full, f)) });
    } else if (EXT_RE.test(entry.name)) {
      const stem = entry.name.replace(EXT_RE, '');
      const product = matchProduct(stem);
      if (!product) { unmatched.push(entry.name + ' (no product match)'); continue; }
      const existing = jobs.find((j) => j.product.id === product.id);
      if (existing) existing.files.push(full);
      else jobs.push({ product, files: [full] });
    }
  }

  console.log(`PLAN (${apply ? 'APPLY' : 'DRY'}): ${jobs.length} products with images, ${unmatched.length} unmatched files.`);
  for (const j of jobs) console.log(`  ${j.product.part_number || j.product.name} -> ${j.files.length} image(s)`);
  if (unmatched.length) console.log('UNMATCHED:', unmatched.map((u) => `"${u}"`).join(', '));

  if (!apply) return;

  // --- execute
  let uploadedFn = 0;
  for (const j of jobs) {
    const { product, files } = j;
    const rows = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = path.extname(file).toLowerCase().replace('.', '');
      const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const storagePath = `products/${product.id}/${filename}`;
      const buf = fs.readFileSync(file);

      const up = await fetch(base + '/storage/v1/object/products/' + storagePath, {
        method: 'POST',
        headers: { apikey: anon, Authorization: 'Bearer ' + token, 'Content-Type': mime },
        body: buf,
      });
      if (up.status !== 200) {
        console.error(`  upload failed for ${file}: ${up.status} ${(await up.text()).slice(0, 120)}`);
        continue;
      }

      const url = `${base}/storage/v1/object/public/products/${storagePath}`;
      const ins = await fetch(base + '/rest/v1/product_images?select=*', {
        method: 'POST',
        headers: { ...A, Prefer: 'return=representation' },
        body: JSON.stringify({
          product_id: product.id,
          path: storagePath,
          url,
          alt_text: `${product.name} - Image ${i + 1}`,
          is_primary: i === 0,
          order_index: i,
        }),
      });
      const row = (await ins.json())[0];
      if (ins.status !== 201) { console.error(`  image row failed for ${file}: ${ins.status}`); continue; }
      rows.push(row);
      uploadedFn++;
    }

    if (rows.length > 0) {
      await fetch(base + '/rest/v1/products?id=eq.' + product.id, {
        method: 'PATCH',
        headers: A,
        body: JSON.stringify({ primary_image_id: rows[0].id, primary_image_url: rows[0].url }),
      });
    }
    console.log(`  done: ${product.part_number || product.name} (${rows.length} images)`);
  }
  console.log(`COMPLETE: ${uploadedFn} images uploaded.`);
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });