process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');

const CONNECTION = process.env.DATABASE_URL;

async function main() {
  const client = new Client({ connectionString: CONNECTION, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const count = await client.query(`SELECT COUNT(*) AS total FROM products`);
  console.log('PRODUCT COUNT:', count.rows[0].total);

  const cols = await client.query(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products' ORDER BY ordinal_position`
  );
  console.log('PRODUCT COLUMNS:', cols.rows.map((r) => `${r.column_name}:${r.data_type}`).join(', '));

  const active = await client.query(`SELECT COUNT(*) AS active FROM products WHERE is_active = true`);
  console.log('ACTIVE:', active.rows[0].active);

  const featured = await client.query(`SELECT COUNT(*) AS featured FROM products WHERE is_featured = true`);
  console.log('FEATURED:', featured.rows[0].featured);

  const sample = await client.query(`SELECT id, name, is_active, is_featured, category_id, brand_id, price FROM products LIMIT 5`);
  console.log('SAMPLE:', JSON.stringify(sample.rows, null, 2));

  await client.end();
}

main().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});