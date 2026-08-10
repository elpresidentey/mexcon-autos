/**
 * Local brand logo imagery (SVG files in /public).
 * Falls back by exact slug only; null means "no logo" -> render text.
 */
const brandLogoPaths: Record<string, string> = {
  'toyota': '/toyota-svgrepo-com.svg',
  'lexus': '/lexus-svgrepo-com.svg',
  'honda': '/honda-9-logo-svgrepo-com.svg',
  'acura': '/acura-svgrepo-com.svg',
  'nissan': '/nissan-svgrepo-com.svg',
  'infiniti': '/infiniti-svgrepo-com.svg',
  'mazda': '/mazda-2-logo-svgrepo-com.svg',
  'mitsubishi': '/mitsubishi-svgrepo-com.svg',
  'subaru': '/subaru-alt-svgrepo-com.svg',
  'suzuki': '/suzuki-svgrepo-com.svg',
  'hyundai': '/hyundai-svgrepo-com.svg',
  'kia': '/kia-motors-1-logo-svgrepo-com.svg',
};

export function getBrandLogo(slug?: string | null): string | null {
  if (!slug) return null;
  return brandLogoPaths[slug] || null;
}