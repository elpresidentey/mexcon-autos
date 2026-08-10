import type { ReactNode } from 'react';
import { siteImages, type SiteImageKey } from '../../data/siteImages';

export interface PageHeroProps {
  titleLine1: string;
  titleLine2?: string;
  accentLine?: 1 | 2;
  description?: string;
  image?: SiteImageKey | string;
  size?: 'default' | 'tall' | 'compact';
  align?: 'left' | 'center';
  eyebrow?: string;
  children?: ReactNode;
}

const resolveImage = (image?: SiteImageKey | string) => {
  if (!image) return siteImages.hero;
  if (image in siteImages) return siteImages[image as SiteImageKey];
  return image;
};

export const PageHero = ({
  titleLine1,
  titleLine2,
  accentLine = 2,
  description,
  image = 'hero',
  size = 'default',
  align = 'left',
  eyebrow,
  children,
}: PageHeroProps) => {
  const src = resolveImage(image);
  const heightClass =
    size === 'tall'
      ? 'py-16 lg:py-24 min-h-[420px] lg:min-h-[480px]'
      : size === 'compact'
        ? 'py-10 lg:py-12'
        : 'py-12 lg:py-16 min-h-[280px]';

  return (
    <section className="relative bg-dark-900 text-white overflow-hidden">
      <div className="absolute inset-0">
        <img src={src} alt="" aria-hidden="true" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-900/88 to-dark-900/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/70 via-transparent to-dark-900/25" />
      </div>
      <div className="absolute inset-x-0 top-0 h-1 bg-accent-500" />

      <div className={`container-custom relative z-10 ${heightClass} flex flex-col justify-center`}>
        <div className={align === 'center' ? 'max-w-2xl mx-auto text-center' : 'max-w-3xl'}>
          {eyebrow && (
            <p className="font-display text-accent-400 text-xs sm:text-sm font-bold uppercase tracking-[0.24em] mb-3">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[0.95] tracking-wide uppercase">
            <span className={accentLine === 1 ? 'text-accent-400' : 'text-white'}>{titleLine1}</span>
            {titleLine2 && (
              <span className={`block mt-1 ${accentLine === 2 ? 'text-accent-400' : 'text-white'}`}>
                {titleLine2}
              </span>
            )}
          </h1>
          {description && (
            <p className={`mt-4 text-sm lg:text-base text-metallic-200 leading-relaxed max-w-xl ${align === 'center' ? 'mx-auto' : ''}`}>
              {description}
            </p>
          )}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    </section>
  );
};
