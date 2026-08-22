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
    itemList: { kind: 'categories' },
  },
  '/brands': {
    title: `Shop by Brand | ${SITE_NAME}`,
    description: 'Genuine parts for Lexus, Toyota, Honda, Mitsubishi, Nissan, Acura, Kia and Hyundai vehicles.',
    itemList: { kind: 'brands' },
  },
  '/faqs': {
    title: `FAQs - Delivery, Payment & Returns | ${SITE_NAME}`,
    description: 'Answers about ordering, delivery, payment, returns and warranties at Mexcon Autos.',
    faq: true,
  },
  '/quote-request': {
    title: `Request a Free Quote | ${SITE_NAME}`,
    description: "Can't find a part? Request a quote and we'll confirm availability and pricing within 24 hours.",
  },
  '/about': { title: `About Mexcon Autos | Japanese & Korean Auto Spare Parts`, description: 'Who we are: trusted suppliers of genuine OEM Japanese and Korean auto parts across Nigeria.' },
  '/contact': { title: `Contact Us | ${SITE_NAME}`, description: 'Call, WhatsApp or email Mexcon Autos for parts enquiries, quotes and support.' },
  '/payment-methods': { title: `Payment Methods | ${SITE_NAME}`, description: 'Bank transfer, card payments and pay-on-delivery options for your auto parts orders.' },
  '/guarantees': { title: `Our Guarantees | ${SITE_NAME}`, description: '100% genuine parts, 30-day returns and manufacturer warranties on every order.' },
  '/maintenance-tips': { title: `Maintenance Tips | ${SITE_NAME}`, description: 'Practical car maintenance tips from the Mexcon Autos team.' },
  '/track-order': { title: `Track Your Order | ${SITE_NAME}`, description: 'Track your Mexcon Autos order with your order number and email address.' },
  '/privacy-policy': { title: `Privacy Policy | ${SITE_NAME}`, description: 'How Mexcon Autos collects, uses and protects your personal information.' },
  '/terms': { title: `Terms & Conditions | ${SITE_NAME}`, description: 'Terms governing purchases from Mexcon Autos.' },
};

// Utility/account pages should stay out of search results.
const NOINDEX_PATHS = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/cart',
  '/checkout',
  '/account',
]);

// Mirrors the FAQs shown on /faqs (FAQPage rich results).
const FAQ_DATA = [
  ['Are your auto parts genuine?', 'Yes, all our auto parts are 100% genuine. We source directly from manufacturers and authorized distributors in Japan and Korea. Every part comes with a quality guarantee.'],
  ['How long does delivery take?', 'We deliver nationwide within 24-48 hours. Lagos orders typically arrive within 24 hours, while other states may take up to 48 hours depending on location.'],
  ['What payment methods do you accept?', 'We accept bank transfers, card payments (Visa, Mastercard, Verve), and pay-on-delivery in select locations including Lagos, Abuja, Port Harcourt, and Ibadan.'],
  ["Can I return a part if it doesn't fit?", "Yes, we offer a 30-day return policy. If a part doesn't fit or is defective, you can return it for a full refund or exchange, provided it's unused and in original packaging."],
  ['Do you offer installation services?', "While we don't directly offer installation, we can recommend trusted mechanics and workshops in your area. Contact us for recommendations."],
  ['How do I know which part fits my vehicle?', 'Use our vehicle search tool to find parts by manufacturer, model, year, and engine type. You can also contact our technical team for free assistance in finding the right part.'],
  ['Do you ship outside Nigeria?', 'Currently, we only ship within Nigeria. However, we can assist international customers with special orders. Contact us for more information.'],
  ['What if the part I need is not listed?', "We have access to millions of parts. If you don't see what you need, submit a quote request and we'll source it for you within 24 hours."],
  ['Do you offer warranty on parts?', 'Yes, most parts come with manufacturer warranty ranging from 3-12 months. Specific warranty information is listed on each product page.'],
  ['Can I track my order?', "Yes, once your order is shipped, you'll receive a tracking number via SMS and email. You can track your order in real-time until delivery."],
];

function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_DATA.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

async function itemListJsonLd(kind) {
  const rows = await supabase(
    kind === 'categories'
      ? 'categories?select=name,slug&is_active=eq.true&order=order_index.asc'
      : 'brands?select=name,slug&is_active=eq.true&order=order_index.asc'
  );
  const base = kind === 'categories' ? '/categories' : '/brands';
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: (rows || []).map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: r.name,
      url: `${SITE_URL}${base}/${r.slug}`,
    })),
  };
}

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

function inject(html, { title, description, canonicalPath, ogType, image, jsonLd, noindex }) {
  const canonical = `${SITE_URL}${canonicalPath}`;
  let out = html;

  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  out = out.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${escapeHtml(description)}" />`);
  if (noindex) {
    out = out.replace(/<meta\s+name="robots"[^>]*>/, `<meta name="robots" content="noindex, follow" />`);
  }
  out = out.replace(/<meta\s+property="og:title"[^>]*>/, `<meta property="og:title" content="${escapeHtml(title)}" />`);
  out = out.replace(/<meta\s+property="og:description"[^>]*>/, `<meta property="og:description" content="${escapeHtml(description)}" />`);
  out = out.replace(/<meta\s+property="og:url"[^>]*>/, `<meta property="og:url" content="${canonical}" />`);
  out = out.replace(/<meta\s+property="og:image"[^>]*>/, `<meta property="og:image" content="${escapeHtml(image)}" />`);
  out = out.replace(/<meta\s+property="og:type"[^>]*>/, `<meta property="og:type" content="${ogType || 'website'}" />`);
  out = out.replace(/<meta\s+property="twitter:title"[^>]*>/, `<meta property="twitter:title" content="${escapeHtml(title)}" />`);
  out = out.replace(/<meta\s+property="twitter:description"[^>]*>/, `<meta property="twitter:description" content="${escapeHtml(description)}" />`);
  out = out.replace(/<meta\s+property="twitter:image"[^>]*>/, `<meta property="twitter:image" content="${escapeHtml(image)}" />`);

  const blocks = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];
  // Replace the shell's default canonical (never stack two canonical tags).
  const canonTag = `<link rel="canonical" href="${canonical}" />`;
  if (/<link\s+rel="canonical"/.test(out)) {
    out = out.replace(/<link\s+rel="canonical"[^>]*>/, canonTag);
    const head = blocks
      .map((b) => `<script type="application/ld+json">${JSON.stringify(b).replace(/</g, '\\u003c')}</script>`)
      .join('\n');
    out = out.replace('</head>', `${head}\n</head>`);
  } else {
    const head = [canonTag, ...blocks.map((b) => `<script type="application/ld+json">${JSON.stringify(b).replace(/</g, '\\u003c')}</script>`)].join('\n');
    out = out.replace('</head>', `${head}\n</head>`);
  }
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
    let notFound = false;

    let m;
    if ((m = path.match(/^\/products\/([^/]+)$/))) {
      try {
        const pm = await productMeta(m[1]);
        if (pm) { meta = pm; canonicalPath = path; } else { notFound = true; }
      } catch { /* fall back */ }
    } else if ((m = path.match(/^\/categories\/([^/]+)$/))) {
      try {
        const cm = await categoryMeta(m[1]);
        if (cm) { meta = cm; canonicalPath = path; } else { notFound = true; }
      } catch { /* fall back */ }
    } else if ((m = path.match(/^\/brands\/([^/]+)$/))) {
      try {
        const bm = await brandMeta(m[1]);
        if (bm) { meta = bm; canonicalPath = path; } else { notFound = true; }
      } catch { /* fall back */ }
    }

    // Unknown product/category/brand: tell crawlers this page does not exist
    // instead of serving a soft-404 copy of the homepage.
    if (notFound) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Robots-Tag', 'noindex');
      res.end(
        `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Not found | ${SITE_NAME}</title></head><body><p>This page could not be found. <a href="${SITE_URL}/shop">Browse the shop</a>.</p></body></html>`
      );
      return;
    }

    if (!meta) meta = STATIC_PAGES['/'];

    // Extra structured data for listing and FAQ pages.
    const extraLd = [];
    try {
      if (meta.faq) extraLd.push(faqJsonLd());
      if (meta.itemList) extraLd.push(await itemListJsonLd(meta.itemList.kind));
    } catch (e) {
      console.error('itemList/faq ld failed:', e.message);
    }
    const jsonLdBlocks = [...(meta.jsonLd ? [meta.jsonLd] : []), ...extraLd];

    const noindex = NOINDEX_PATHS.has(path);
    const shell = await getShell();
    const html = inject(shell, {
      title: meta.title,
      description: meta.description,
      canonicalPath,
      ogType: meta.ogType,
      image: meta.image || `${SITE_URL}/og-image.png`,
      jsonLd: jsonLdBlocks.length ? jsonLdBlocks : undefined,
      noindex,
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    res.setHeader('X-Robots-Tag', noindex ? 'noindex, follow' : 'index, follow');
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