process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();
  console.log('CONNECTED');

  const keepEmails = ['admin@mexconautos.com'];

  const { rows: authUsers } = await client.query(
    `SELECT id, email, email_confirmed_at IS NOT NULL AS confirmed, created_at
       FROM auth.users
      ORDER BY created_at`
  );
  const toDelete = authUsers.filter((u) => !keepEmails.includes(u.email));
  const keep = authUsers.filter((u) => keepEmails.includes(u.email));

  console.log('\n-- AUTH USERS FOUND --');
  for (const u of authUsers) {
    console.log(`  ${u.confirmed ? 'confirmed  ' : 'unconfirmed'} ${u.email}  (created ${u.created_at.toISOString?.() ?? u.created_at})`);
  }
  console.log(`\nKEEP:    ${keep.length} (${keep.map((k) => k.email).join(', ')})`);
  console.log(`DELETE:  ${toDelete.length} accounts`);

  if (toDelete.length === 0) {
    console.log('\nNothing to delete. Done.');
    return;
  }

  const ids = toDelete.map((u) => u.id);

  const { rows: customers } = await client.query(
    `SELECT id, email FROM customers WHERE auth_id = ANY($1)`,
    [ids]
  );
  console.log(`Customer rows tied to deleted accounts: ${customers.length}`);

  await client.query('BEGIN');
  try {
    if (customers.length > 0) {
      const customerIds = customers.map((c) => c.id);
      await client.query(`DELETE FROM customers WHERE id = ANY($1)`, [customerIds]);
      console.log('Deleted customer rows (orders cascade).');
    }
    const del = await client.query(`DELETE FROM auth.users WHERE id = ANY($1)`, [ids]);
    console.log(`Deleted ${del.rowCount} auth user(s).`);
    await client.query('COMMIT');
    console.log('\nDONE - only the admin account remains.');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
}

main()
  .catch((err) => {
    console.error('ERROR:', err.message);
    process.exitCode = 1;
  })
  .finally(() => client.end());