process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');

const CONN =
  process.env.DATABASE_URL;

const DUPLICATES = [
  'engine-parts',
  'brake-wheel-hub-bearings',
  'suspension-parts',
  'steering-parts',
  'cooling-heating-system',
  'electrical',
  'fuel-system-fuel-injection',
  'body-light-parts',
  'air-filters',
  'oil-filter',
  'engine-oil',
  'lubricants-fluids',
  'transmission-fluid',
  'accessories',
  'tools-gadget-safety-products',
];

(async () => {
  const client = new Client({
    connectionString: CONN,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    const res = await client.query(
      'update categories set is_active = false, updated_at = now() where slug = any($1) returning slug, name',
      [DUPLICATES]
    );
    res.rows.forEach((r) => console.log('deactivated:', r.slug, '-', r.name));
    const remaining = await client.query(
      "select slug, name, is_active from categories where is_active order by name"
    );
    console.log('\nNow active (' + remaining.rows.length + '):');
    remaining.rows.forEach((r) => console.log(' ', r.slug, '-', r.name));
  } finally {
    await client.end();
  }
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});