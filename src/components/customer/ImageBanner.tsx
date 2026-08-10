import { siteImages, type SiteImageKey } from '../../data/siteImages';

interface ImageBannerProps {
  image: SiteImageKey | string;
  title: string;
  description?: string;
  reverse?: boolean;
}

const resolveImage = (image: SiteImageKey | string) => {
  if (image in siteImages) return siteImages[image as SiteImageKey];
  return image;
};

export const ImageBanner = ({ image, title, description, reverse = false }: ImageBannerProps) => (
  <section className="py-14 lg:py-20 bg-white border-y border-metallic-200">
    <div className="container-custom">
      <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-metallic-100">
          <img
            src={resolveImage(image)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div>
          <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-wide uppercase text-dark-900 leading-tight">
            {title}
          </h2>
          {description && (
            <p className="text-sm lg:text-base text-metallic-600 mt-4 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
    </div>
  </section>
);
