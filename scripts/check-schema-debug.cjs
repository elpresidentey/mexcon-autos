process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');

const CONNECTION = process.env.DATABASE_URL;

async function main() {
  const client = new Client({ connectionString: CONNECTION, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const pol = await client.query(
    `SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
     FROM pg_policies WHERE tablename = 'enquiries'`
  );
  console.log('POLICIES:', JSON.stringify(pol.rows, null, 2));

  const trig = await client.query(
    `SELECT tgname, tgenabled, tgtype FROM pg_trigger WHERE tgrelid = 'enquiries'::regclass AND NOT tgisinternal`
  );
  console.log('TRIGGERS:', JSON.stringify(trig.rows));

  const cols = await client.query(
    `SELECT column_name, is_nullable, column_default FROM information_schema.columns
     WHERE table_schema='public' AND table_name='enquiries' ORDER BY ordinal_position`
  );
  console.log('COLUMNS:', JSON.stringify(cols.rows, null, 2));

  await client.end();
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });