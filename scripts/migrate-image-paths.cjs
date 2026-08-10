process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');
const path = require('path');

process.loadEnvFile(path.join(__dirname, '..', '.env'));
const CONNECTION = process.env.DATABASE_URL;

const MAPPINGS = [
  ['/car engine.jpg', '/car-engine.webp'],
  ['/brake system.jpg', '/brake-system.webp'],
  ['/Steering pumps.jpg', '/steering-pumps.webp'],
  ['/transmission.jpg', '/transmission.webp'],
  ['/supension.jpg', '/suspension.webp'],
  ['/wesley-tingey-2fTXCO4Cz1A-unsplash.jpg', '/wesley-tingey-2fTXCO4Cz1A-unsplash.webp'],
];

const COLUMNS = ['products.primary_image_url', 'product_images.url'];

(async () => {
  const client = new Client({ connectionString: CONNECTION, ssl: { rejectUnauthorized: false } });
  await client.connect();

  for (const [oldPath, newPath] of MAPPINGS) {
    for (const col of COLUMNS) {
      const [table, column] = col.split('.');
      const result = await client.query(
        `UPDATE ${table} SET ${column} = REPLACE(${column}, $1, $2) WHERE ${column} LIKE '%' || $1 || '%'`,
        [oldPath, newPath]
      );
      if (result.rowCount > 0) console.log(`${col}: '${oldPath}' -> '${newPath}' (${result.rowCount} rows)`);
    }
  }

  const leftover = await client.query(
    `SELECT (SELECT count(*) FROM products WHERE primary_image_url LIKE '%/car engine.jpg%' OR primary_image_url LIKE '%/transmission.jpg%' OR primary_image_url LIKE '%/brake system.jpg%' OR primary_image_url LIKE '%/Steering pumps.jpg%' OR primary_image_url LIKE '%/supension.jpg%' OR primary_image_url LIKE '%/wesley%') AS products, (SELECT count(*) FROM product_images WHERE url LIKE '%/car engine.jpg%' OR url LIKE '%/transmission.jpg%' OR url LIKE '%/brake system.jpg%' OR url LIKE '%/Steering pumps.jpg%' OR url LIKE '%/supension.jpg%' OR url LIKE '%/wesley%') AS images`
  );
  console.log('LEFTOVER OLD PATHS:', JSON.stringify(leftover.rows[0]));
  await client.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });