process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');

const CONNECTION = process.env.DATABASE_URL;

async function main() {
  const client = new Client({ connectionString: CONNECTION, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query('SET ROLE anon');
    const r = await client.query(
      `INSERT INTO enquiries (customer_name, customer_email, customer_phone, vehicle_details, message)
       VALUES ('Smoke Test User', 'smoke-test@example.com', '08000000000', 'Toyota Camry 2017', 'Smoke test part request')
       RETURNING id`
    );
    console.log('ANON INSERT OK:', r.rows[0].id);
    await client.query('DELETE FROM enquiries WHERE id = $1', [r.rows[0].id]);
    console.log('CLEANED UP');
  } catch (e) {
    console.log('ANON INSERT FAILED:', e.message);
  } finally {
    await client.query('RESET ROLE');
    await client.end();
  }
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });