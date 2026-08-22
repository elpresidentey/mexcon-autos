// One-off: compress oversized images in Supabase storage in place.
// Signs in as the admin (ADMIN_EMAIL/ADMIN_PASSWORD), lists objects per
// bucket, and re-uploads anything > LIMIT with sharp (max width 1400).
process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const URL = process.env.VITE_SUPABASE_URL;
const ANON = process.env.VITE_SUPABASE_ANON_KEY;
const BUCKETS = ['products', 'categories', 'brands', 'banners'];
const LIMIT_BYTES = 200 * 1024;
const MAX_W = 1400;

(async () => {
  const authRes = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }),
  });
  if (!authRes.ok) throw new Error('admin login failed: ' + authRes.status);
  const { access_token } = await authRes.json();
  const headers = { apikey: ANON, Authorization: `Bearer ${access_token}` };

  let totalSaved = 0;
  let count = 0;

  for (const bucket of BUCKETS) {
    const files = [];
    let queue = [''];
    while (queue.length) {
      const prefix = queue.shift();
      const listRes = await fetch(`${URL}/storage/v1/object/list/${bucket}`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix, limit: 1000, sortBy: { column: 'name', order: 'asc' } }),
      });
      if (!listRes.ok) { console.log(`list ${bucket}/${prefix} failed: ${listRes.status}`); continue; }
      const objects = await listRes.json();
      for (const obj of objects) {
        if (obj.id === null) queue.push(obj.name);
        else files.push(obj);
      }
    }
    console.log(`${bucket}: ${files.length} files scanned`);

    for (const obj of files) {
      const size = obj.metadata?.size || 0;
      if (size <= LIMIT_BYTES) continue;

      const path = obj.name;
      const dl = await fetch(`${URL}/storage/v1/object/${bucket}/${path}`, { headers });
      if (!dl.ok) { console.log(`dl fail ${bucket}/${path}: ${dl.status}`); continue; }
      const buf = Buffer.from(await dl.arrayBuffer());
      const ctype = obj.metadata?.mimetype || dl.headers.get('content-type') || '';

      try {
        let out, outType;
        if (ctype.includes('png')) {
          out = await sharp(buf).resize({ width: MAX_W, withoutEnlargement: true }).png({ compressionLevel: 9, palette: true }).toBuffer();
          outType = 'image/png';
        } else {
          out = await sharp(buf).rotate().resize({ width: MAX_W, withoutEnlargement: true }).jpeg({ quality: 78, mozjpeg: true }).toBuffer();
          outType = 'image/jpeg';
        }
        if (out.length >= buf.length) { console.log(`skip (no gain) ${bucket}/${path}`); continue; }

        const up = await fetch(`${URL}/storage/v1/object/${bucket}/${path}`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': outType, 'x-upsert': 'true' },
          body: out,
        });
        if (!up.ok) { console.log(`up fail ${bucket}/${path}: ${up.status} ${await up.text()}`); continue; }
        totalSaved += buf.length - out.length;
        count++;
        console.log(`${Math.round(buf.length / 1024)}KB -> ${Math.round(out.length / 1024)}KB  ${bucket}/${path}`);
      } catch (e) {
        console.log(`err ${bucket}/${path}: ${e.message}`);
      }
    }
  }

  console.log(`DONE. ${count} files recompressed, saved ${Math.round(totalSaved / 1024)}KB`);
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });