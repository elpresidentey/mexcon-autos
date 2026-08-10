import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { productsService } from '../../services/products.service';
import { useCart } from '../../contexts/CartContext';
import type { Product } from '../../types';
import { LoadingSpinner, Breadcrumbs, Button } from '../../components/common';
import { Seo, productJsonLd, breadcrumbJsonLd, organizationJsonLd } from '../../components/Seo';
import { WhatsAppIcon, buildWhatsAppLink } from '../../components/customer/WhatsAppButton';
import { generateProductWhatsAppMessage } from '../../utils/helpers';
import { formatCurrency } from '../../utils/helpers';
import {
  PhotoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  TruckIcon,
  ShieldCheckIcon,
  ClockIcon,
  ShoppingBagIcon,
  MinusIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [whatsAppMessage, setWhatsAppMessage] = useState('');

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      setIsLoading(true);
      const data = await productsService.getProduct(productId);

      if (!data) {
        navigate('/404');
        return;
      }

      setProduct(data);
      setWhatsAppMessage(generateProductWhatsAppMessage(data.name, data.oem_number));

      // Increment view count
      productsService.incrementViewCount(productId);
    } catch (error) {
      console.error('Error loading product:', error);
      navigate('/404');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevImage = () => {
    if (product?.images?.length) {
      setSelectedImageIndex((prev) =>
        prev === 0 ? product.images!.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (product?.images?.length) {
      setSelectedImageIndex((prev) =>
        prev === product.images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);
    try {
      await addToCart(product, quantity);
      toast.success(`${product.name} added to cart`);
    } catch {
      toast.error('Failed to add item to cart. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const images = product.images?.length
    ? product.images
    : product.primary_image_url
      ? [{ id: 'primary', url: product.primary_image_url, path: '', is_primary: true, order_index: 0, product_id: product.id, created_at: product.created_at }]
      : [];

  const selectedImage = images[selectedImageIndex]?.url;

  const breadcrumbItems = [
    { label: 'Shop', href: '/shop' },
    ...(product.category ? [{ label: product.category.name, href: `/categories/${product.category.slug}` }] : []),
    { label: product.name },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title={product.name}
        description={product.description?.slice(0, 160) || `${product.name} - genuine spare part available at Mexcon Autos`}
        canonicalPath={`/products/${product.id}`}
        image={selectedImage}
        type="product"
        jsonLd={[
          organizationJsonLd(),
          breadcrumbJsonLd(breadcrumbItems),
          productJsonLd({
            name: product.name,
            description: product.description,
            image: selectedImage,
            sku: product.part_number,
            brand: product.brand?.name,
            price: product.price,
          }),
        ]}
      />

      {/* Hero Bar - Bold */}
      <section className="relative bg-dark-900 text-white overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-400 via-accent-500 to-primary-400" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="container-custom relative z-10 py-10 lg:py-12">
          <Breadcrumbs items={breadcrumbItems} onDark />
        </div>
      </section>

      <div className="container-custom py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 mt-4">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gradient-to-br from-metallic-50 to-metallic-100 rounded-3xl overflow-hidden border border-metallic-200/50 shadow-sm">
              {selectedImage ? (
                <>
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg shadow-dark-900/10 transition-all hover:scale-110"
                        aria-label="Previous image"
                      >
                        <ChevronLeftIcon className="w-6 h-6 text-dark-900" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg shadow-dark-900/10 transition-all hover:scale-110"
                        aria-label="Next image"
                      >
                        <ChevronRightIcon className="w-6 h-6 text-dark-900" />
                      </button>
                    </>
                  )}

                  {/* Featured Badge */}
                  {product.is_featured && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-accent-400 to-accent-500 text-black text-xs font-black rounded-full shadow-lg shadow-accent-500/30">
                        ★ Featured
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-metallic-300">
                  <PhotoIcon className="w-32 h-32" />
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-white rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      selectedImageIndex === index
                        ? 'border-accent-500 shadow-lg shadow-accent-500/20'
                        : 'border-metallic-200/60 hover:border-accent-400/60 hover:shadow-md'
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full h-full object-contain p-1.5"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-7">
            {/* Brand */}
            {product.brand && (
              <Link
                to={`/brands/${product.brand.slug}`}
                className="inline-block text-sm font-black text-accent-600 hover:text-accent-700 uppercase tracking-widest transition-colors"
              >
                {product.brand.name}
              </Link>
            )}

            {/* Product Name */}
            <h1 className="text-2xl lg:text-3xl font-bold text-dark-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Category */}
            {product.category && (
              <div>
                <span className="inline-flex items-center px-4 py-1.5 bg-primary-50 border border-primary-200/60 rounded-full text-sm font-bold text-primary-700">
                  {product.category.name}
                </span>
              </div>
            )}

            {/* Price */}
            {product.price > 0 && (
              <div className="flex items-baseline space-x-3">
                <span className="text-2xl lg:text-3xl font-bold text-primary-600 tracking-tight">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-sm text-metallic-500 font-medium">
                  (price on request - subject to availability)
                </span>
              </div>
            )}

            {/* Part Numbers */}
            {(product.oem_number || product.part_number || product.engine_type) && (
              <div className="bg-gradient-to-br from-metallic-50 to-metallic-100 rounded-2xl p-5 space-y-3 border border-metallic-200/50">
                {product.oem_number && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-metallic-600">OEM Number:</span>
                    <span className="text-sm text-dark-900 font-mono font-semibold">{product.oem_number}</span>
                  </div>
                )}
                {product.part_number && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-metallic-600">Part Number:</span>
                    <span className="text-sm text-dark-900 font-mono font-semibold">{product.part_number}</span>
                  </div>
                )}
                {product.engine_type && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-metallic-600">Engine Type:</span>
                    <span className="text-sm text-dark-900 font-semibold">{product.engine_type}</span>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div>
                <h2 className="text-lg font-black text-dark-900 mb-2 tracking-tight">Description</h2>
                <p className="text-metallic-700 leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {/* Specifications */}
            {product.specifications && (
              <div>
                <h2 className="text-lg font-black text-dark-900 mb-2 tracking-tight">Specifications</h2>
                <p className="text-metallic-700 leading-relaxed whitespace-pre-line">{product.specifications}</p>
              </div>
            )}

            {/* Compatibility Notes */}
            {product.compatibility_notes && (
              <div>
                <h2 className="text-lg font-black text-dark-900 mb-2 tracking-tight">Compatibility</h2>
                <p className="text-metallic-700 leading-relaxed whitespace-pre-line">{product.compatibility_notes}</p>
              </div>
            )}

            {/* Compatible Models */}
            {product.compatible_models && product.compatible_models.length > 0 && (
              <div>
                <h2 className="text-lg font-black text-dark-900 mb-3 tracking-tight">Compatible Models</h2>
                <div className="flex flex-wrap gap-2">
                  {product.compatible_models.map((model, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 px-3 py-2 bg-primary-50 text-primary-700 rounded-xl border border-primary-200/60 font-medium"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      <span className="text-sm">{model}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="pt-7 border-t border-metallic-200/60 space-y-4">
              {product.price > 0 && (
                <div className="flex items-stretch gap-4">
                  <div className="flex items-center bg-metallic-50 rounded-2xl border border-metallic-200">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-12 h-14 flex items-center justify-center text-dark-900 hover:text-primary-600 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <MinusIcon className="w-5 h-5" />
                    </button>
                    <span className="w-12 text-center font-bold text-lg text-dark-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-12 h-14 flex items-center justify-center text-dark-900 hover:text-primary-600 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 font-black rounded-2xl shadow-xl shadow-primary-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary-500/40"
                  >
                    <ShoppingBagIcon className="w-5 h-5" />
                    {isAdding ? 'Adding...' : 'Add to Cart'}
                  </Button>
                </div>
              )}

              <Button
                size="lg"
                onClick={() => navigate(`/quote-request?product=${product.id}`)}
                className="w-full bg-white text-dark-900 border-2 border-metallic-200 hover:border-primary-400 hover:text-primary-700 font-bold rounded-2xl transition-all duration-300"
              >
                Request a Quote
              </Button>

              {whatsAppMessage && (
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(whatsAppMessage)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    buildWhatsAppLink(whatsAppMessage).then((url) => {
                      window.open(url, '_blank', 'noopener,noreferrer');
                    });
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-2xl shadow-xl shadow-green-600/25 transition-all duration-300 hover:scale-[1.02]"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  Ask on WhatsApp
                </a>
              )}

              {!product.price || product.price === 0 ? (
                <p className="text-sm text-metallic-500 text-center font-medium">
                  Price on request — use the quote form or WhatsApp to get pricing.
                </p>
              ) : (
                <p className="text-sm text-metallic-500 text-center font-medium">
                  Add to cart and check out, or get a quote for bulk pricing.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info - Bold */}
        <div className="mt-16 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white rounded-3xl p-10 lg:p-14 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-xl lg:text-2xl font-bold tracking-tight mb-8">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-lime-400">Mexcon Autos?</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start space-x-4 group">
                <div className="w-14 h-14 bg-gradient-to-br from-accent-400 to-accent-500 text-black rounded-2xl flex items-center justify-center shadow-lg shadow-accent-500/30 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <ShieldCheckIcon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-black text-lg mb-1">Genuine & OEM Parts</h3>
                  <p className="text-sm text-metallic-300 leading-relaxed">High-quality original and equivalent parts</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 group">
                <div className="w-14 h-14 bg-gradient-to-br from-accent-400 to-accent-500 text-black rounded-2xl flex items-center justify-center shadow-lg shadow-accent-500/30 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <ClockIcon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-black text-lg mb-1">Expert Support</h3>
                  <p className="text-sm text-metallic-300 leading-relaxed">Our team helps you find the right part</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 group">
                <div className="w-14 h-14 bg-gradient-to-br from-accent-400 to-accent-500 text-black rounded-2xl flex items-center justify-center shadow-lg shadow-accent-500/30 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <TruckIcon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-black text-lg mb-1">Fast Response</h3>
                  <p className="text-sm text-metallic-300 leading-relaxed">Quick quotes and availability confirmation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
