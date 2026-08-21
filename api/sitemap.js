// Dynamic sitemap.xml: static marketing routes + live catalogue URLs
// (products, categories, brands) pulled from Supabase at request time.
// Served at /sitemap.xml via a vercel.json rewrite; cached at the edge.

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';
export const SITE_URL = 'https://mextechautospareparts.com';

const STATIC_ROUTES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/shop', changefreq: 'daily', priority: '0.9' },
  { path: '/categories', changefreq: 'weekly', priority: '0.8' },
  { path: '/brands', changefreq: 'weekly', priority: '0.8' },
  { path: '/quote-request', changefreq: 'monthly', priority: '0.7' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact', changefreq: 'monthly', priority: '0.6' },
  { path: '/payment-methods', changefreq: 'monthly', priority: '0.6' },
  { path: '/guarantees', changefreq: 'monthly', priority: '0.6' },
  { path: '/faqs', changefreq: 'monthly', priority: '0.6' },
  { path: '/maintenance-tips', changefreq: 'monthly', priority: '0.5' },
  { path: '/track-order', changefreq: 'monthly', priority: '0.5' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
];

async function supabase(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  return res.json();
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function urlEntry(loc, lastmod, changefreq, priority) {
  const parts = [`<loc>${esc(loc)}</loc>`];
  if (lastmod) parts.push(`<lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>`);
  if (changefreq) parts.push(`<changefreq>${changefreq}</changefreq>`);
  if (priority) parts.push(`<priority>${priority}</priority>`);
  return `<url>${parts.join('')}</url>`;
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

  const entries = STATIC_ROUTES.map((r) =>
    urlEntry(`${SITE_URL}${r.path}`, null, r.changefreq, r.priority)
  );

  try {
    const [products, categories, brands] = await Promise.all([
      supabase('products?select=id,updated_at&is_active=eq.true&order=updated_at.desc&limit=5000'),
      supabase('categories?select=slug,updated_at&is_active=eq.true'),
      supabase('brands?select=slug,updated_at&is_active=eq.true'),
    ]);

    for (const p of products) entries.push(urlEntry(`${SITE_URL}/products/${p.id}`, p.updated_at, 'weekly', '0.8'));
    for (const c of categories) entries.push(urlEntry(`${SITE_URL}/categories/${c.slug}`, c.updated_at, 'weekly', '0.7'));
    for (const b of brands) entries.push(urlEntry(`${SITE_URL}/brands/${b.slug}`, b.updated_at, 'weekly', '0.7'));
  } catch (err) {
    console.error('sitemap catalogue fetch failed:', err.message);
    // Static routes still ship even if the catalogue query fails.
  }

  res.end(
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>`
  );
}