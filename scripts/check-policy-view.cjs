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
  await client.query(`NOTIFY pgrst, 'reload schema'`);
  await new Promise((r) => setTimeout(r, 1500));

  const r = await fetch(`${supabaseUrl}/rest/v1/diag_policies?select=tablename,policyname,roles,cmd,with_check&tablename=eq.enquiries`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  });
  console.log('REST DIAG POLICIES for enquiries:', r.status, JSON.stringify(await r.json(), null, 2));
  const r2 = await fetch(`${supabaseUrl}/rest/v1/diag_policies?select=tablename,policyname,roles,cmd,with_check`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  });
  console.log('ALL ROWS:', JSON.stringify(await r2.json(), null, 2));
  await client.end();
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });