// Dynamic rendering for crawlers and social link previews.
//
// The storefront is a client-rendered SPA, so most bots would otherwise see a
// single generic <title>. vercel.json rewrites bot user-agents to this
// function, which returns the app shell with per-route <title>, description,
// canonical, Open Graph/Twitter tags and JSON-LD injected server-side.
// Human visitors are never routed here.

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';
const SITE_URL = 'https://mextechautospareparts.com';
const SITE_NAME = 'Mexcon Autos';

const DEFAULT_DESCRIPTION =
  'Buy genuine Japanese and Korean auto spare parts in Nigeria. Parts for Toyota, Honda, Lexus, Nissan, Mitsubishi, Acura, Kia and Hyundai with nationwide delivery.';

const STATIC_PAGES = {
  '/': {
    title: `${SITE_NAME} - Genuine Japanese & Korean Auto Spare Parts`,
    description: DEFAULT_DESCRIPTION,
  },
  '/shop': {
    title: `Shop Auto Spare Parts | ${SITE_NAME}`,
    description: 'Browse our full catalogue of genuine Japanese and Korean auto parts. Filter by brand, category, model year and engine type.',
  },
  '/categories': {
    title: `Parts Categories | ${SITE_NAME}`,
    description: 'Explore parts by system: water pumps, fuel pumps, oil pumps, plug coils, steering pumps, steering racks and more.',
  },
  '/brands': {
    title: `Shop by Brand | ${SITE_NAME}`,
    description: 'Genuine parts for Lexus, Toyota, Honda, Mitsubishi, Nissan, Acura, Kia and Hyundai vehicles.',
  },
  '/quote-request': {
    title: `Request a Free Quote | ${SITE_NAME}`,
    description: "Can't find a part? Request a quote and we'll confirm availability and pricing within 24 hours.",
  },
  '/about': { title: `About Us | ${SITE_NAME}`, description: 'Who we are: trusted suppliers of genuine OEM Japanese and Korean auto parts across Nigeria.' },
  '/contact': { title: `Contact Us | ${SITE_NAME}`, description: 'Call, WhatsApp or email Mexcon Autos for parts enquiries, quotes and support.' },
  '/payment-methods': { title: `Payment Methods | ${SITE_NAME}`, description: 'Bank transfer, card payments and pay-on-delivery options for your auto parts orders.' },
  '/guarantees': { title: `Our Guarantees | ${SITE_NAME}`, description: '100% genuine parts, 30-day returns and manufacturer warranties on every order.' },
  '/faqs': { title: `FAQs | ${SITE_NAME}`, description: 'Answers about ordering, delivery, payment, returns and warranties at Mexcon Autos.' },
  '/maintenance-tips': { title: `Maintenance Tips | ${SITE_NAME}`, description: 'Practical car maintenance tips from the Mexcon Autos team.' },
  '/track-order': { title: `Track Your Order | ${SITE_NAME}`, description: 'Track your Mexcon Autos order with your order number and email address.' },
  '/privacy-policy': { title: `Privacy Policy | ${SITE_NAME}`, description: 'How Mexcon Autos collects, uses and protects your personal information.' },
  '/terms': { title: `Terms & Conditions | ${SITE_NAME}`, description: 'Terms governing purchases from Mexcon Autos.' },
};

async function supabase(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  return res.json();
}

function naira(n) {
  return `NGN ${Number(n || 0).toLocaleString('en-NG')}`;
}

async function productMeta(id) {
  const rows = await supabase(
    `products?select=id,name,description,price,part_number,oem_number,stock_status,brands(name),categories(name),product_images(url)&id=eq.${encodeURIComponent(id)}&limit=1`
  );
  const p = rows && rows[0];
  if (!p) return null;
  const brand = p.brands?.name ? p.brands.name + ' ' : '';
  const image = Array.isArray(p.product_images) && p.product_images[0]?.url ? p.product_images[0].url : `${SITE_URL}/og-image.png`;
  return {
    title: `${brand}${p.name}${p.part_number ? ` (${p.part_number})` : ''} | ${SITE_NAME}`,
    description:
      p.description
        ? p.description.slice(0, 155)
        : `Buy the ${brand}${p.name} at ${SITE_NAME}. ${naira(p.price)} · 100% genuine · nationwide delivery.`,
    ogType: 'product',
    image,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      sku: p.part_number || undefined,
      mpn: p.oem_number || undefined,
      description: p.description || undefined,
      image: image.startsWith('http') ? [image] : undefined,
      brand: p.brands?.name ? { '@type': 'Brand', name: p.brands.name } : undefined,
      category: p.categories?.name || undefined,
      offers: {
        '@type': 'Offer',
        url: `${SITE_URL}/products/${p.id}`,
        priceCurrency: 'NGN',
        price: String(p.price),
        availability:
          p.stock_status === 'in_stock' || p.stock_status === 'low_stock'
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Organization', name: SITE_NAME },
      },
    },
  };
}

async function categoryMeta(slug) {
  const rows = await supabase(`categories?select=name,description&slug=eq.${encodeURIComponent(slug)}&limit=1`);
  const c = rows && rows[0];
  if (!c) return null;
  return {
    title: `${c.name} Parts | ${SITE_NAME}`,
    description: c.description || `Shop genuine ${c.name.toLowerCase()} for Japanese and Korean vehicles at ${SITE_NAME}. Nationwide delivery.`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Categories', item: `${SITE_URL}/categories` },
        { '@type': 'ListItem', position: 3, name: c.name, item: `${SITE_URL}/categories/${slug}` },
      ],
    },
  };
}

async function brandMeta(slug) {
  const rows = await supabase(`brands?select=name,description&slug=eq.${encodeURIComponent(slug)}&limit=1`);
  const b = rows && rows[0];
  if (!b) return null;
  return {
    title: `${b.name} Parts | ${SITE_NAME}`,
    description: b.description || `Shop genuine ${b.name} auto parts at ${SITE_NAME}. Water pumps, fuel pumps, linkages and more with nationwide delivery.`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Brands', item: `${SITE_URL}/brands` },
        { '@type': 'ListItem', position: 3, name: b.name, item: `${SITE_URL}/brands/${slug}` },
      ],
    },
  };
}

let shellCache = { html: null, at: 0 };
async function getShell() {
  if (shellCache.html && Date.now() - shellCache.at < 5 * 60 * 1000) return shellCache.html;
  const res = await fetch(`${SITE_URL}/index.html`, { headers: { 'user-agent': 'MexconRenderBot/1.0' } });
  if (!res.ok) throw new Error(`shell ${res.status}`);
  const html = await res.text();
  shellCache = { html, at: Date.now() };
  return html;
}

function inject(html, { title, description, canonicalPath, ogType, image, jsonLd }) {
  const canonical = `${SITE_URL}${canonicalPath}`;
  let out = html;

  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  out = out.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${escapeHtml(description)}" />`);
  out = out.replace(/<meta\s+property="og:title"[^>]*>/, `<meta property="og:title" content="${escapeHtml(title)}" />`);
  out = out.replace(/<meta\s+property="og:description"[^>]*>/, `<meta property="og:description" content="${escapeHtml(description)}" />`);
  out = out.replace(/<meta\s+property="og:url"[^>]*>/, `<meta property="og:url" content="${canonical}" />`);
  out = out.replace(/<meta\s+property="og:image"[^>]*>/, `<meta property="og:image" content="${escapeHtml(image)}" />`);
  out = out.replace(/<meta\s+property="og:type"[^>]*>/, `<meta property="og:type" content="${ogType || 'website'}" />`);
  out = out.replace(/<meta\s+property="twitter:title"[^>]*>/, `<meta property="twitter:title" content="${escapeHtml(title)}" />`);
  out = out.replace(/<meta\s+property="twitter:description"[^>]*>/, `<meta property="twitter:description" content="${escapeHtml(description)}" />`);
  out = out.replace(/<meta\s+property="twitter:image"[^>]*>/, `<meta property="twitter:image" content="${escapeHtml(image)}" />`);

  const head = [
    `<link rel="canonical" href="${canonical}" />`,
    jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>` : '',
  ].join('\n');
  out = out.replace('</head>', `${head}\n</head>`);
  return out;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default async function handler(req, res) {
  try {
    // Original path arrives via the rewrite's ?path= parameter.
    const rawPath = (req.query && req.query.path) || '/';
    let path;
    try {
      path = decodeURIComponent(Array.isArray(rawPath) ? rawPath[0] : rawPath).split('?')[0];
    } catch {
      path = '/';
    }
    if (!path.startsWith('/')) path = '/' + path;

    let meta = STATIC_PAGES[path] || null;
    let canonicalPath = STATIC_PAGES[path] ? path : '/';

    let m;
    if ((m = path.match(/^\/products\/([^/]+)$/))) {
      try { meta = (await productMeta(m[1])) || meta; canonicalPath = path; } catch { /* fall back */ }
    } else if ((m = path.match(/^\/categories\/([^/]+)$/))) {
      try { meta = (await categoryMeta(m[1])) || meta; canonicalPath = path; } catch { /* fall back */ }
    } else if ((m = path.match(/^\/brands\/([^/]+)$/))) {
      try { meta = (await brandMeta(m[1])) || meta; canonicalPath = path; } catch { /* fall back */ }
    }

    if (!meta) meta = STATIC_PAGES['/'];

    const shell = await getShell();
    const html = inject(shell, {
      title: meta.title,
      description: meta.description,
      canonicalPath,
      ogType: meta.ogType,
      image: meta.image || `${SITE_URL}/og-image.png`,
      jsonLd: meta.jsonLd,
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    res.setHeader('X-Robots-Tag', 'index, follow');
    res.end(html);
  } catch (err) {
    console.error('render error:', err.message);
    // Never break crawling: send the plain shell.
    try {
      const shell = await getShell();
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(shell);
    } catch {
      res.statusCode = 500;
      res.end('Service unavailable');
    }
  }
}