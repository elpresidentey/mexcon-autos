process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const CONNECTION = process.env.DATABASE_URL;

async function main() {
  const client = new Client({ connectionString: CONNECTION, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20260808_fix_enquiry_image_policies.sql'), 'utf8');
  await client.query(sql);
  console.log('IMAGE_POLICY_FIX_OK');

  const r = await client.query(
    `SELECT policyname, cmd, roles, qual, with_check FROM pg_policies WHERE tablename = 'enquiry_images' ORDER BY policyname`
  );
  console.log(JSON.stringify(r.rows, null, 2));

  await client.end();
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });