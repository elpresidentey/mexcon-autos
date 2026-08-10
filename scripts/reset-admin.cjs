process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');

const CONNECTION = process.env.DATABASE_URL;

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@mexconautos.com';
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error('Set ADMIN_PASSWORD env var');

  const client = new Client({ connectionString: CONNECTION, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('CONNECTED');

  // 1. Does the auth user exist?
  const existing = await client.query('SELECT id, email, email_confirmed_at FROM auth.users WHERE email = $1', [email]);
  let userId;
  if (existing.rows.length > 0) {
    userId = existing.rows[0].id;
    console.log('AUTH USER EXISTS:', email, 'confirmed_at:', JSON.stringify(existing.rows[0].email_confirmed_at));
  } else {
    // Create a new auth user (email + bcrypt hash via gen_salt/crypt)
    const uuid = require('crypto').randomUUID();
    const ins = await client.query(
      `INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
       VALUES ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', $2,
               crypt($3, gen_salt('bf')), now(), now(), now(),
               '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, '', '', '', '')
       RETURNING id`,
      [uuid, email, password]
    );
    userId = ins.rows[0].id;
    console.log('AUTH USER CREATED:', userId);
  }

  // 2. Reset password + confirm email
  const upd = await client.query(
    `UPDATE auth.users
     SET encrypted_password = crypt($2, gen_salt('bf')),
         email_confirmed_at = COALESCE(email_confirmed_at, now()),
         confirmation_token = '',
         updated_at = NOW()
     WHERE id = $1
     RETURNING id`,
    [userId, password]
  );
  console.log('PASSWORD RESET + EMAIL CONFIRMED:', upd.rows[0].id);

  // 3. Ensure admin_users row exists for this email
  const adminRes = await client.query(
    `INSERT INTO admin_users (name, email, role)
     VALUES ('Super Admin', $1, 'super_admin')
     ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
     RETURNING id, name, email, role`,
    [email]
  );
  console.log('ADMIN_USER:', JSON.stringify(adminRes.rows[0]));

  await client.end();
  console.log('DONE - try logging into the app with', email, '/ (your given password)');
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });