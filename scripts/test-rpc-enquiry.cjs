const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://cwjhkdmsvympkdrpuyvv.supabase.co';
const anonKey = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];

async function main() {
  const r = await fetch(`${supabaseUrl}/rest/v1/rpc/submit_enquiry`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      customer_name: 'REST Tester',
      customer_email: 'rest@test.com',
      customer_phone: '08000000000',
      vehicle_details: 'Toyota Camry 2010',
      message: 'RPC smoke test',
      product_id: null,
    }),
  });
  const body = await r.text();
  console.log('RPC VIA REST =>', r.status, body.slice(0, 400));
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });