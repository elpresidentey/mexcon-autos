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

  // recreate the two standard policies first
  await client.query(`DROP POLICY IF EXISTS "Public can create enquiries" ON public.enquiries`);
  await client.query(`DROP POLICY IF EXISTS "Admins can manage enquiries" ON public.enquiries`);
  await client.query(`CREATE POLICY "Public can create enquiries" ON public.enquiries FOR INSERT TO anon, authenticated WITH CHECK (true)`);
  await client.query(`CREATE POLICY "Admins can manage enquiries" ON public.enquiries FOR ALL TO anon, authenticated USING (public.is_admin())`);

  const cases = [
    { name: 'minimal (no Prefer)', init: (h) => h },
    { name: 'return=minimal', init: (h) => { h.set('Prefer', 'return=minimal'); return h; } },
    { name: 'return=representation', init: (h) => { h.set('Prefer', 'return=representation'); return h; } },
  ];
  for (const c of cases) {
    const h = new Headers({ apikey: anonKey, Authorization: `Bearer ${anonKey}`, 'Content-Type': 'application/json' });
    c.init(h);
    const r = await fetch(`${supabaseUrl}/rest/v1/enquiries`, {
      method: 'POST',
      headers: h,
      body: JSON.stringify({ customer_name: 'T', customer_email: 't@t.com', message: 'm' }),
    });
    const body = await r.text();
    console.log(c.name, '=>', r.status, body.slice(0, 220));
    if (r.status === 201) {
      await client.query(`DELETE FROM enquiries WHERE customer_email = 't@t.com'`);
    }
  }
  await client.end();
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });