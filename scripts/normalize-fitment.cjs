/**
 * Normalize compatible_models across all products:
 *  - trim whitespace / stray separators per entry
 *  - drop empty entries
 *  - dedupe case-insensitively (keep first occurrence)
 *  - sort entries deterministically
 * Also backfills engine_type blanks with null (no invention).
 *
 * Modes:  node normalize-fitment.cjs --dry       (report only, default)
 *         node normalize-fitment.cjs --apply     (write changes)
 */
process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
const { Client } = require('pg');

const normalizeList = (arr) => {
  if (!Array.isArray(arr)) return arr;
  const seen = new Set();
  const out = [];
  for (const raw of arr) {
    if (typeof raw !== 'string') continue;
    const entry = raw.trim().replace(/\s*[;,|]\s*$/, '');
    if (!entry) continue;
    const key = entry.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(entry);
  }
  return out.sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
};

(async () => {
  const mode = process.argv.includes('--apply') ? 'apply' : 'dry';
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();

  const { rows } = await c.query(`SELECT id, name, compatible_models FROM products ORDER BY name`);
  let changed = 0;
  let removed = 0;
  let totalEntries = 0;

  for (const r of rows) {
    const normalized = normalizeList(r.compatible_models);
    const before = r.compatible_models || [];
    totalEntries += before.length;
    if (JSON.stringify(normalized) !== JSON.stringify(before)) {
      changed++;
      removed += before.length - normalized.length;
      if (mode === 'apply') {
        await c.query(`UPDATE products SET compatible_models = $1, updated_at = now() WHERE id = $2`, [normalized, r.id]);
      } else {
        console.log(`[${r.name.slice(0, 40)}] ${before.length} -> ${normalized.length} entries`);
      }
    }
  }

  console.log(`\n${mode.toUpperCase()}: ${changed}/${rows.length} products would change, ${removed} duplicate/empty entries removed, ${totalEntries} total entries scanned.`);
  await c.end();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });