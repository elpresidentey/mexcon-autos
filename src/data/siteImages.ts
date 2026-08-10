/** Curated imagery for Mexcon Autos — Unsplash, free to use */
export const siteImages = {
  hero: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1920&q=80',
  shop: 'https://images.unsplash.com/photo-1625047509168-a7022880cb4e?auto=format&fit=crop&w=1920&q=80',
  about: 'https://images.unsplash.com/photo-1619642759868-74b4a38b234c?auto=format&fit=crop&w=1920&q=80',
  contact: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1920&q=80',
  warehouse: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
  workshop: 'https://images.unsplash.com/photo-1487754180451-c456904332a9?auto=format&fit=crop&w=1200&q=80',
  delivery: 'https://images.unsplash.com/photo-1601584111127-372948e1d783?auto=format&fit=crop&w=1200&q=80',
  engine: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80',
  brakes: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
  suspension: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80',
  electrical: 'https://images.unsplash.com/photo-1615906656403-ad03851676ca?auto=format&fit=crop&w=800&q=80',
  brands: 'https://images.unsplash.com/photo-1494976388531-d1058498bf24?auto=format&fit=crop&w=1920&q=80',
  categories: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80',
  quote: 'https://images.unsplash.com/photo-1617814076367-badea6d3c7e2?auto=format&fit=crop&w=1920&q=80',
  faq: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1920&q=80',
  guarantees: 'https://images.unsplash.com/photo-1563729784474-d77ddc1a2f4e?auto=format&fit=crop&w=1920&q=80',
  payment: 'https://images.unsplash.com/photo-1556740758-90de374c12d4?auto=format&fit=crop&w=1920&q=80',
  maintenance: 'https://images.unsplash.com/photo-1487754180451-c456904332a9?auto=format&fit=crop&w=1920&q=80',
  legal: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1920&q=80',
} as const;

export type SiteImageKey = keyof typeof siteImages;

const categoryFallbacks = [
  siteImages.engine,
  siteImages.brakes,
  siteImages.suspension,
  siteImages.electrical,
  siteImages.workshop,
  siteImages.delivery,
];

export const getCategoryFallbackImage = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return categoryFallbacks[Math.abs(hash) % categoryFallbacks.length];
};
