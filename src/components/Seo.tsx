import { useEffect } from 'react';

interface SeoProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalPath?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  jsonLd?: Record<string, unknown>[];
}

const SITE_NAME = 'Mexcon Autos';
const SITE_URL = 'https://mextechautospareparts.com';

export const Seo = ({
  title,
  description,
  keywords,
  canonicalPath,
  image,
  type = 'website',
  jsonLd,
}: SeoProps) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Japanese & Korean Auto Spare Parts`;
    const metaDescription =
      description ||
      'Quality genuine Japanese and Korean auto spare parts in Nigeria. Request a quote for Lexus, Toyota, Honda, Mitsubishi, Nissan, Acura, Kia and Hyundai.';

    // Title
    document.title = fullTitle;

    // Canonical
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalPath ? `${SITE_URL}${canonicalPath}` : window.location.href.split('?')[0]);

    // Open Graph
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', metaDescription);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', window.location.href.split('?')[0]);
    if (image) setMeta('property', 'og:image', image);

    // Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', metaDescription);
    if (image) setMeta('name', 'twitter:image', image);

    // Standard meta tags
    setMeta('name', 'description', metaDescription);
    if (keywords) setMeta('name', 'keywords', keywords);

    // JSON-LD structured data
    let script = document.getElementById('seo-jsonld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'seo-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd || []);

    return () => {
      // Reset title on unmount
      document.title = SITE_NAME;
    };
  }, [title, description, keywords, canonicalPath, image, type, jsonLd]);

  return null;
};

const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
  let tag = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

// --- Structured data builders (Task 49) ---

export const organizationJsonLd = (settings?: {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: settings?.name || SITE_NAME,
  url: SITE_URL,
  email: settings?.email,
  telephone: settings?.phone,
  address: settings?.address,
  sameAs: [],
});

export const webSiteJsonLd = (): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: 'en-NG',
  description:
    'Genuine Japanese and Korean auto spare parts in Nigeria. Order online or request a quote.',
  publisher: {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
  },
});

export const webPageJsonLd = (opts: {
  name?: string;
  description?: string;
  path: string;
}): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: opts.name || SITE_NAME,
  url: `${SITE_URL}${opts.path}`,
  description: opts.description,
  isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME },
});

export const productJsonLd = (product: {
  name: string;
  description?: string;
  image?: string;
  sku?: string;
  brand?: string;
  price?: number;
}): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: product.image,
  sku: product.sku,
  brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
  offers: {
    '@type': 'Offer',
    price: product.price ?? 0,
    priceCurrency: 'NGN',
    availability: 'https://schema.org/InStock',
  },
});

export const breadcrumbJsonLd = (items: { label: string; href?: string }[]): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.label,
    ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
  })),
});

export default Seo;
