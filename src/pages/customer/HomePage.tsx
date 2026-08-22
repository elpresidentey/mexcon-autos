import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, EmptyState, Reveal } from '../../components/common';
import { sbImg } from '../../services/supabase';
import { Seo, organizationJsonLd, webSiteJsonLd, webPageJsonLd } from '../../components/Seo';
import { ProductCard } from '../../components/customer/ProductCard';
import { BrandCard } from '../../components/customer/BrandCard';
import { VehicleSearch } from '../../components/customer/VehicleSearch';
import { productsService } from '../../services/products.service';
import { categoriesService } from '../../services/categories.service';
import { brandsService } from '../../services/brands.service';
import { bannersService } from '../../services/banners.service';
import type { Product, Category, Brand } from '../../types';
import {
  ShieldCheckIcon,
  TruckIcon,
  ClockIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import heroImage from '../../assets/images/hero.webp';
import heroImageMobile from '../../assets/images/hero-mobile.webp';
import { getCategoryImage } from '../../components/customer/categoryImages';

interface HeroSlide {
  key: string;
  image: string;
  eyebrow: string;
  title: string;
  accent: string;
  subtitle?: string;
  ctaText: string;
  ctaLink: string;
}

const fallbackSlides: HeroSlide[] = [
  {
    key: 'slide-1',
    image: heroImage,
    eyebrow: 'Mexcon Autos',
    title: 'Genuine Japanese',
    accent: '& Korean Parts',
    subtitle:
      'OEM-quality parts for Lexus, Toyota, Honda, Mitsubishi, Nissan, Acura, Kia and Hyundai — fair pricing, nationwide delivery, quotes in 24 hours.',
    ctaText: 'Browse Catalog',
    ctaLink: '/shop',
  },
  {
    key: 'slide-2',
    image: '/hero-2.webp',
    eyebrow: 'Mexcon Autos',
    title: 'New Arrivals',
    accent: 'Stocked Weekly',
    subtitle:
      'Fresh OEM-quality parts for Japanese and Korean vehicles, checked and ready to ship across Nigeria.',
    ctaText: 'Browse Catalog',
    ctaLink: '/shop',
  },
  {
    key: 'slide-3',
    image: '/hero-3.webp',
    eyebrow: 'Mexcon Autos',
    title: "Can't Find a Part?",
    accent: 'We\u2019ll Source It',
    subtitle:
      'Tell us what you need and we\u2019ll confirm availability and pricing within 24 hours.',
    ctaText: 'Get Free Quote',
    ctaLink: '/quote-request',
  },
];

const testimonials = [
  {
    name: 'Emeka O.',
    role: 'Mechanic, Lagos',
    quote: 'I needed brake pads for a 2015 Toyota Camry and got a quote within hours. Genuine parts, fair price. Mexcon Autos is now my first call.',
  },
  {
    name: 'Aisha B.',
    role: 'Car Owner, Abuja',
    quote: 'They helped me source a water pump for my Toyota Camry that I had been searching for months. Excellent communication throughout.',
  },
  {
    name: 'Chinedu N.',
    role: 'Auto Dealer, Port Harcourt',
    quote: 'As a dealer I rely on consistent supply. Mexcon Autos has never let me down on quality or delivery times.',
  },
];

const features = [
  {
    icon: ShieldCheckIcon,
    title: 'Genuine Parts',
    description: 'OEM and equivalent parts from trusted suppliers',
  },
  {
    icon: TruckIcon,
    title: 'Nationwide Delivery',
    description: 'Careful packaging and reliable shipping across Nigeria',
  },
  {
    icon: ClockIcon,
    title: '24hr Quotes',
    description: 'Every request answered within one business day',
  },
];

const howItWorks = [
  {
    icon: MagnifyingGlassIcon,
    step: '01',
    title: 'Find Your Part',
    description: 'Search your vehicle or browse the catalogue by brand and category.',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    step: '02',
    title: 'Confirm Price & Availability',
    description: 'Order online instantly, or request a quote and we respond within 24 hours.',
  },
  {
    icon: BanknotesIcon,
    step: '03',
    title: 'Pay Securely',
    description: 'Complete your order online or on delivery with our flexible payment options.',
  },
  {
    icon: TruckIcon,
    step: '04',
    title: 'We Deliver',
    description: 'Quality-checked parts packaged with care and shipped nationwide.',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const ProductCardSkeleton = () => (
  <div className="card" aria-hidden="true">
    <div className="aspect-[4/3] bg-metallic-100 animate-pulse" />
    <div className="p-4 space-y-2.5">
      <div className="h-2.5 w-1/3 bg-metallic-100 animate-pulse rounded-full" />
      <div className="h-4 w-4/5 bg-metallic-100 animate-pulse rounded-full" />
      <div className="h-4 w-1/2 bg-metallic-100 animate-pulse rounded-full" />
      <div className="h-5 w-1/4 bg-metallic-100 animate-pulse rounded-lg" />
    </div>
  </div>
);

interface CategoryTileProps {
  name: string;
  slug: string;
  productCount?: number;
  size: string;
  isHero?: boolean;
  imageUrl?: string | null;
}

const CategoryTile = ({ name, slug, productCount, size, isHero, imageUrl }: CategoryTileProps) => {
  const imgUrl = getCategoryImage({ slug, image_url: imageUrl });
  const displayUrl: string | undefined = (imgUrl && (sbImg(imgUrl, 900) || imgUrl)) || undefined;
  const count = productCount || 0;
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = imgUrl && !imgFailed;

  return (
    <Link
      to={`/categories/${slug}`}
      className={`group relative overflow-hidden rounded-2xl bg-metallic-100 ring-1 ring-black/5 shadow-sm hover:shadow-xl hover:shadow-dark-900/15 hover:ring-2 hover:ring-primary-500/60 transition-all duration-300 ${size}`}
    >
      {showImage ? (
        <img
          src={displayUrl}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
          loading="lazy"
          decoding="async"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-metallic-200 to-metallic-100">
          <span className="flex items-center justify-center w-16 h-16 rounded-full border-2 border-metallic-300 bg-white/60 font-display text-2xl font-bold text-metallic-500 uppercase">
            {name.charAt(0)}
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-dark-900/95 via-dark-900/45 to-transparent" />

      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold">
        {count} {count === 1 ? 'product' : 'products'}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between gap-3">
        <div>
          <h3 className={`font-display font-bold text-white tracking-wide uppercase leading-tight ${isHero ? 'text-2xl' : 'text-lg'}`}>
            {name}
          </h3>
          {isHero && (
            <p className="text-xs text-metallic-300 mt-1.5">OEM & genuine parts — browse the range</p>
          )}
        </div>
        <span className="w-9 h-9 flex-shrink-0 rounded-full bg-accent-500 text-black flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shadow-lg shadow-accent-500/30">
          <ArrowRightIcon className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
};

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [slides, setSlides] = useState<HeroSlide[]>(fallbackSlides);
  const [failedImageKeys, setFailedImageKeys] = useState<Record<string, boolean>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    loadHomepageData();
    loadBanners();
  }, []);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % slides.length);
    }, 4500);
    return () => clearInterval(id);
  }, [isPaused, slides.length]);

  const loadBanners = async () => {
    try {
      const banners = await bannersService.getActiveBanners();
      if (banners.length > 0) {
        setSlides(
          banners.map((banner) => {
            const titleParts = (banner.title ?? '').split('\n');
            return {
              key: banner.id,
              image: sbImg(banner.image_url, 1600) || banner.image_url,
              eyebrow: 'Mexcon Autos',
              title: titleParts[0] || 'Genuine Japanese',
              accent: titleParts[1] || 'Auto Parts',
              subtitle: banner.subtitle,
              ctaText: banner.cta_text || 'Get Free Quote',
              ctaLink: banner.cta_link || '/quote-request',
            };
          })
        );
        setActiveIndex(0);
      }
    } catch (error) {
      console.error('Error loading banners:', error);
    }
  };

  const goToSlide = (index: number) => {
    setActiveIndex((index + slides.length) % slides.length);
  };

  const activeSlide = slides[activeIndex] ?? fallbackSlides[0];

  const renderSlideImage = (slide: HeroSlide) => {
    const url = failedImageKeys[slide.key] ? heroImage : slide.image;
    return (
      <motion.img
        key={slide.key}
        src={url}
        srcSet={url === heroImage ? `${heroImageMobile} 720w, ${heroImage} 1920w` : undefined}
        sizes="100vw"
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
        fetchPriority="high"
        onError={() => {
          if (failedImageKeys[slide.key] || slide.image === heroImage) return;
          setFailedImageKeys((prev) => ({ ...prev, [slide.key]: true }));
        }}
        className="w-full h-full object-cover scale-105"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
      />
    );
  };

  const loadHomepageData = async () => {
    try {
      const [featured, latest, cats, brs] = await Promise.all([
        productsService.getFeaturedProducts(8).catch(() => []),
        productsService.getLatestProducts(8).catch(() => []),
        categoriesService.getCategoriesWithProductCounts().catch(() => []),
        brandsService.getFeaturedBrands(8).catch(() => []),
      ]);
      setFeaturedProducts(featured);
      setLatestProducts(latest);
      setCategories(
        cats
          .filter((c) => c.is_active)
          .sort((a, b) => (b.product_count || 0) - (a.product_count || 0))
      );
      setBrands(brs);
    } catch (error) {
      console.error('Error loading homepage data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const carouselProducts = featuredProducts.length > 0 ? featuredProducts : latestProducts;

  return (
    <div>
      <Seo
        description="Mexcon Autos supplies genuine Japanese and Korean auto spare parts in Nigeria. Search by vehicle, browse categories and request quotes within 24 hours."
        canonicalPath="/"
        image="/og-image.png"
        keywords="auto spare parts Nigeria, Japanese car parts, Korean car parts, Toyota parts, Honda parts, Lexus parts, Nissan parts, Mitsubishi parts, Hyundai parts, Kia parts, Acura parts, OEM auto parts, Mexcon Autos"
        jsonLd={[
          organizationJsonLd({
            phone: '+2349035777779',
            email: 'info@mextechautospareparts.com',
            address: 'Zone B, Block 3, Shop 85, ASPAMDA, Lagos International Trade Fair Complex, Ojo, Lagos',
          }),
          webSiteJsonLd(),
          webPageJsonLd({
            name: 'Mexcon Autos - Genuine Japanese & Korean Auto Spare Parts',
            description:
              'Buy genuine Japanese and Korean auto spare parts in Nigeria. Browse by vehicle, brand or category, and request quotes within 24 hours.',
            path: '/',
          }),
        ]}
      />

      {/* Hero */}
      <section
        className="relative min-h-[calc(100svh-4.25rem)] bg-dark-900 text-white overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="absolute inset-0">
          <AnimatePresence mode="sync" initial={false}>
            {renderSlideImage(activeSlide)}
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-900/85 to-dark-900/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-dark-900/30" />
        </div>

        <div className="container-custom relative z-10">
          <div className="min-h-[calc(100svh-4.25rem)] flex items-center py-14 lg:py-16">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-12 items-center w-full">
              <motion.div
                key={activeSlide.key}
                className="max-w-xl"
                initial="initial"
                animate="animate"
                transition={{ staggerChildren: 0.08 }}
              >
                <motion.p
                  variants={fadeUp}
                  transition={{ duration: 0.45 }}
                  className="font-display text-accent-400 text-sm sm:text-base font-bold uppercase tracking-[0.28em] mb-3"
                >
                  {activeSlide.eyebrow}
                </motion.p>
                <motion.h1
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                  className="font-display text-5xl sm:text-6xl lg:text-[4.25rem] font-extrabold leading-[0.92] tracking-wide uppercase text-white"
                >
                  {activeSlide.title}
                  <span className="block text-accent-400">{activeSlide.accent}</span>
                </motion.h1>
                {activeSlide.subtitle && (
                  <motion.p
                    variants={fadeUp}
                    transition={{ duration: 0.5 }}
                    className="mt-5 text-base lg:text-lg text-metallic-200 leading-relaxed max-w-md"
                  >
                    {activeSlide.subtitle}
                  </motion.p>
                )}

                <motion.div
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col sm:flex-row gap-3 mt-7"
                >
                  <Link to={activeSlide.ctaLink}>
                    <Button
                      size="lg"
                      className="bg-accent-500 text-black hover:bg-accent-400 font-semibold px-6 py-3 text-sm rounded-lg w-full sm:w-auto"
                    >
                      {activeSlide.ctaText}
                    </Button>
                  </Link>
                  <Link to={activeSlide.ctaLink === '/quote-request' ? '/shop' : '/quote-request'}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border border-white/70 bg-transparent text-white hover:bg-white hover:text-dark-900 font-semibold px-6 py-3 text-sm rounded-lg w-full sm:w-auto"
                    >
                      {activeSlide.ctaLink === '/quote-request' ? 'Browse Catalog' : 'Get Free Quote'}
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                className="w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.15 }}
              >
                <VehicleSearch variant="hero" />
              </motion.div>
            </div>
          </div>
        </div>

        {slides.length > 1 && (
          <div className="absolute bottom-6 inset-x-0 z-10">
            <div className="container-custom flex items-center justify-between">
              <div className="flex items-center gap-2" aria-label="Hero slides">
                {slides.map((slide, index) => (
                  <button
                    key={slide.key}
                    type="button"
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? 'w-8 bg-accent-400'
                        : 'w-3 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToSlide(activeIndex - 1)}
                  aria-label="Previous slide"
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-white/25 text-white hover:bg-white/10 transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => goToSlide(activeIndex + 1)}
                  aria-label="Next slide"
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-white/25 text-white hover:bg-white/10 transition-colors"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Features */}
      <section className="py-16 lg:py-20 border-b border-metallic-200 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative flex gap-5 p-6 lg:p-7 card card-hover"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-accent-400 to-accent-600 text-black flex items-center justify-center rounded-xl shadow-md shadow-accent-500/25 group-hover:scale-105 transition-transform duration-300">
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold tracking-wide uppercase text-dark-900 group-hover:text-primary-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-metallic-600 mt-2 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 lg:py-24 bg-metallic-50">
        <div className="container-custom">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-wide uppercase text-dark-900">
                Featured Parts
              </h2>
              <p className="text-sm text-metallic-600 mt-2 leading-relaxed">Handpicked stock our customers rely on</p>
            </div>
            <Link
              to="/shop"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors group"
            >
              View all
              <svg className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : carouselProducts.length === 0 ? (
            <EmptyState title="No featured products yet" description="Check back soon for new stock" />
          ) : (
            <Reveal delay={0.08}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {carouselProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </Reveal>
          )}
        </div>
      </section>

      {/* Latest Arrivals */}
      {latestProducts.length > 0 && (
        <section className="bg-white py-16 lg:py-24 border-y border-metallic-200">
          <div className="container-custom">
            <div className="flex items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-wide uppercase text-dark-900">
                  Latest Arrivals
                </h2>
                <p className="text-sm text-metallic-600 mt-2 leading-relaxed">New stock added to the catalogue</p>
              </div>
              <Link
                to="/shop"
                className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors group"
              >
                View all
                <svg className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-16 lg:py-24 bg-white" aria-labelledby="how-it-works-heading">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary-700 uppercase tracking-[0.18em] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
              Simple process
            </span>
            <h2
              id="how-it-works-heading"
              className="font-display text-3xl lg:text-4xl font-bold tracking-wide uppercase text-dark-900"
            >
              How It Works
            </h2>
            <p className="text-sm text-metallic-600 mt-2 leading-relaxed">
              From search to doorstep delivery in four easy steps
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="relative bg-metallic-50 rounded-2xl p-7 ring-1 ring-black/5 shadow-sm hover:shadow-lg hover:shadow-dark-900/8 hover:-translate-y-1 transition-all duration-300"
              >
                <span
                  className="absolute top-5 right-6 font-display text-5xl font-extrabold text-dark-900/5 select-none"
                  aria-hidden="true"
                >
                  {step.step}
                </span>
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 text-white flex items-center justify-center rounded-xl shadow-md shadow-primary-700/25 mb-5">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold tracking-wide uppercase text-dark-900">
                  {step.title}
                </h3>
                <p className="text-sm text-metallic-600 mt-2 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/shop">
              <Button
                size="lg"
                className="bg-accent-500 text-black hover:bg-accent-400 font-semibold px-8 py-3.5 text-sm rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent-500/25"
              >
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 lg:py-24 bg-metallic-50">
        <div className="container-custom">
          <div className="flex items-end justify-between gap-4 mb-12">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary-700 uppercase tracking-[0.18em] mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
                Browse the catalogue
              </span>
              <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-wide uppercase text-dark-900">
                Shop by Category
              </h2>
              <p className="text-sm text-metallic-600 mt-2 leading-relaxed">
                Engine, brakes, suspension and more — find the exact system you need
              </p>
            </div>
            <Link
              to="/categories"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors group"
            >
              View all categories
              <svg className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {categories.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
              {[
                { name: 'Engine Components', slug: 'engine-components' },
                { name: 'Brake System', slug: 'brake-system' },
                { name: 'Suspension', slug: 'suspension' },
                { name: 'Transmission', slug: 'transmission' },
                { name: 'Steering Pumps', slug: 'steering-pumps' },
                { name: 'Lubricants', slug: 'oils-lubricants' },
              ].map((cat, index) => {
                const fallbackSizes = [
                  'col-span-2 row-span-2',
                  'col-span-1 row-span-1',
                  'col-span-1 row-span-1',
                  'col-span-2 row-span-1',
                  'col-span-1 row-span-1',
                  'col-span-2 row-span-1',
                ];
                return (
                  <CategoryTile
                    key={cat.slug}
                    name={cat.name}
                    slug={cat.slug}
                    size={fallbackSizes[index] || 'col-span-1 row-span-1'}
                    isHero={index === 0}
                  />
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
              {categories.slice(0, 8).map((category, index) => {
                const bentoSizes = [
                  'col-span-2 row-span-2',
                  'col-span-1 row-span-1',
                  'col-span-1 row-span-1',
                  'col-span-2 row-span-1',
                  'col-span-1 row-span-1',
                  'col-span-1 row-span-1',
                  'col-span-2 row-span-1',
                  'col-span-1 row-span-1',
                ];
                return (
                  <CategoryTile
                    key={category.id}
                    name={category.name}
                    slug={category.slug}
                    productCount={category.product_count}
                    imageUrl={category.image_url}
                    size={bentoSizes[index] || 'col-span-1 row-span-1'}
                    isHero={index === 0}
                  />
                );
              })}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link to="/categories">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-primary-600 text-primary-700 hover:bg-primary-600 hover:text-white font-semibold px-7 py-3 text-sm rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary-600/20"
              >
                View All Categories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Brands */}
      {brands.length > 0 && (
        <section className="bg-white py-16 lg:py-24 border-y border-metallic-200">
          <div className="container-custom">
            <div className="flex items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-wide uppercase text-dark-900">
                  Shop by Brand
                </h2>
                <p className="text-sm text-metallic-600 mt-2 leading-relaxed">
                  Japanese and Korean manufacturers we stock
                </p>
              </div>
              <Link
                to="/brands"
                className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors group"
              >
                View all
                <svg className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <Reveal delay={0.06}>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {brands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} variant="compact" />
              ))}
            </div>
          </Reveal>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-16 lg:py-24 bg-metallic-50">
        <div className="container-custom">
          <div className="mb-10 max-w-xl">
            <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-wide uppercase text-dark-900">
              Customer Voices
            </h2>
            <p className="text-sm text-metallic-600 mt-2 leading-relaxed">
              From owners, mechanics, and dealers across Nigeria
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.blockquote
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative card card-hover p-7"
              >
                <span className="absolute top-5 right-6 font-display text-6xl leading-none text-metallic-100 select-none" aria-hidden>                  &rdquo;
                </span>
                <div className="flex items-center gap-0.5 text-accent-500 mb-4" role="img" aria-label="Rated 5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-metallic-700 leading-relaxed relative">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <footer className="mt-6 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold text-sm uppercase">
                    {testimonial.name.charAt(0)}
                  </span>
                  <div>
                    <p className="font-semibold text-dark-900 text-sm">{testimonial.name}</p>
                    <p className="text-xs text-metallic-500 uppercase tracking-wider mt-0.5">{testimonial.role}</p>
                  </div>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0di00aC0ydjRoMnptMC0xMHYtNGgtMnY0aDJ6bTAgMjB2LTRoLTJ2NGgyem0wLTEwdi00aC0ydjRoMnptMjAgMHY2aC0ydjZoMnptMCAxMHYtNmgtMnY2aDJ6bTAtMjB2NmgtMnYtNmgyem0tMjAgMHY2aC0ydjZoMnptMCAxMHYtNmgtMnY2aDJ6bTAtMjB2NmgtMnYtNmgyem0tMjAgMHY2aC0ydjZoMnptMCAxMHYtNmgtMnY2aDJ6bTAtMjB2NmgtMnYtNmgyem0tMjAgMHY2aC0ydjZoMnptMCAxMHYtNmgtMnY2aDJ6bTAtMjB2NmgtMnYtNmgyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="container-custom relative">
          <Reveal>
            <div className="max-w-2xl">
            <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-wide uppercase leading-tight">
              Can&apos;t find the part?
            </h2>
            <p className="text-sm lg:text-base text-primary-100/90 mt-4 leading-relaxed">
              Tell us what you need — we&apos;ll confirm availability and pricing within 24 hours.
            </p>
            <Link to="/quote-request" className="inline-block mt-8">
              <Button
                size="lg"
                className="bg-gradient-to-r from-accent-500 to-accent-600 text-black hover:from-accent-400 hover:to-accent-500 font-semibold px-8 py-3.5 text-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                Request a Quote
              </Button>
            </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
