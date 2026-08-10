const fs = require('fs');
const path = require('path');
const anonKey = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];
const baseUrl = 'https://cwjhkdmsvympkdrpuyvv.supabase.co';
const email = `buyer${Date.now()}@gmail.com`;

(async () => {
  const r = await fetch(`${baseUrl}/rest/v1/rpc/register_customer`, {
    method: 'POST',
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_email: email, p_password: 'BuyerPass123!', p_first_name: 'Ada', p_last_name: 'Okafor', p_phone: null }),
  });
  console.log('FULL:', r.status, JSON.stringify(await r.json()));
})();