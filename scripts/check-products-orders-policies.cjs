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

  const pols = await client.query(`SELECT tablename, policyname, cmd, roles, qual, with_check
    FROM pg_policies WHERE tablename IN ('products','product_images','orders','order_items','customers','cart_items')
    ORDER BY tablename, policyname`);
  console.log('POLICIES:');
  for (const r of pols.rows) console.log(`  ${r.tablename} | ${r.policyname} | ${r.cmd} | roles ${r.roles} | using ${r.qual} | check ${r.with_check}`);

  const grants = await client.query(`SELECT table_name, grantee, string_agg(privilege_type, ',') privs
    FROM information_schema.role_table_grants
    WHERE table_schema='public' AND table_name IN ('products','product_images','orders','order_items','customers','cart_items')
    AND grantee IN ('anon','authenticated','service_role')
    GROUP BY 1,2 ORDER BY 1,2`);
  console.log('GRANTS:');
  for (const r of grants.rows) console.log(`  ${r.table_name} | ${r.grantee} | ${r.privs}`);

  await client.end();

  const r2 = await fetch(`${supabaseUrl}/storage/v1/bucket`, { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } });
  console.log('BUCKETS:', r2.status, JSON.stringify(await r2.json()));
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });