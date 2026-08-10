/**
 * Local placeholder imagery for category tiles (used when a category has no
 * uploaded image). Falls back by exact slug first, then by keyword substring.
 */
const categoryPlaceholderImages: Record<string, string> = {
  'engine-components': '/car-engine.webp',
  'engine-parts': '/car-engine.webp',
  'brake-system': '/brake-system.webp',
  'brake-wheel-hub-bearings': '/brake-system.webp',
  'suspension': '/suspension.webp',
  'suspension-parts': '/suspension.webp',
  'steering': '/steering-pumps.webp',
  'steering-pumps': '/steering-pumps.webp',
  'transmission': '/transmission.webp',
  'cooling-system': '/car-engine.webp',
  'electrical-components': '/car-engine.webp',
  'fuel-system': '/car-engine.webp',
  'body-parts': '/car-engine.webp',
  'lighting': '/brake-system.webp',
  'filters': '/car-engine.webp',
  'accessories': '/car-engine.webp',
  'oils-lubricants': '/car-engine.webp',
};

export function getCategoryImage(category: {
  slug?: string | null;
  image_url?: string | null;
}): string | null {
  if (category.image_url) return category.image_url;
  if (!category.slug) return '/car-engine.webp';

  if (categoryPlaceholderImages[category.slug]) {
    return categoryPlaceholderImages[category.slug];
  }

  const slug = category.slug.toLowerCase();
  for (const key of Object.keys(categoryPlaceholderImages)) {
    if (slug.includes(key)) return categoryPlaceholderImages[key];
  }

  // Default fallback - use car engine image for any unmapped category
  return '/car-engine.webp';
}