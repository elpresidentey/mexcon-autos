const fs = require('fs');
const path = require('path');
const anonKey = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];
const url = 'https://cwjhkdmsvympkdrpuyvv.supabase.co';

(async () => {
  const body = new FormData();
  body.append('file', new Blob(['test'], { type: 'text/plain' }), 'test.txt');
  const r = await fetch(`${url}/storage/v1/object/enquiries/test-${Date.now()}.txt`, {
    method: 'POST',
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    body,
  });
  console.log('UPLOAD:', r.status, await r.text());
})();