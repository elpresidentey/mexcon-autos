process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const email = 'wlc' + Math.floor(Date.now() / 1000) + '@mexcon.mx';
  const r = await client.query(
    `SELECT el.id, el.email_type, el.status, el.job_id, el.created_at, c.email
       FROM email_logs el
       JOIN customers c ON c.id = el.customer_id
      WHERE el.email_type = 'welcome'
      ORDER BY el.created_at DESC
      LIMIT 5`
  );
  console.log('WELCOME EMAIL LOGS (last 5):');
  for (const row of r.rows) {
    console.log(`  [${row.created_at.toISOString?.() ?? row.created_at}] ${row.email_type} ${row.status} job=${row.job_id ?? 'none'} -> ${row.email}`);
  }
  const latest = r.rows[0];
  if (latest && latest.job_id) {
    const status = await client.query(`SELECT status, attempt_count, next_retry_at FROM net._http_response WHERE id = $1`, [latest.job_id]);
    console.log('PG_NET JOB:', JSON.stringify(status.rows[0] ?? 'not found'));
  }
  await client.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });