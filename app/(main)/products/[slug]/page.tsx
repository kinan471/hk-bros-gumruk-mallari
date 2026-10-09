import { createPublicServerClient } from '@/lib/supabase/public-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Truck, MessageCircle, RotateCcw, Star } from 'lucide-react';
import ProductReviewsSection from '@/components/products/ProductReviewsSection';
import ProductGallery from '@/components/products/ProductGallery';
import AddToCartButton from '@/components/products/AddToCartButton';
import ProductCard from '@/components/products/ProductCard';
import { fetchReviewSummaries } from '@/lib/utils/reviewSummaries';
import { STORE_RETURN_WINDOW_DAYS, STORE_SHIPPING } from '@/lib/config/store';
import { getCurrentProductPrice, isDiscountedPrice } from '@/lib/utils/pricing';

export const dynamic = 'force-static';
export const revalidate = 3600;

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const supabase = createPublicServerClient();
  const { data: product } = await supabase
    .from('products')
    .select('name, short_description')
    .eq('slug', slug)
    .single();
    
  return {
    title: product ? `${product.name} - HK BROS` : 'Ürün Bulunamadı',
    description: product?.short_description || 'HK BROS Gümrük Malları',
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const supabase = createPublicServerClient();

  const { data: product, error } = await supabase
    .from('products')
    .select('id, name, slug, brand, regular_price, sale_price, short_description, description, track_inventory, stock_status, stock_quantity, product_type, weight, length, width, height, sku, main_image, is_featured, is_on_sale, category_id, product_condition')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !product) {
    notFound();
  }

  const [galleryRes, categoriesRes, ratingRes] = await Promise.all([
    supabase.from('product_images').select('image_url').eq('product_id', product.id).order('display_order'),
    supabase.from('categories').select('id, name, slug, parent_id'),
    supabase.from('reviews').select('id, product_id, user_name, rating, comment, created_at').eq('product_id', product.id).eq('is_approved', true)
  ]);

  if (galleryRes.error) throw galleryRes.error;
  if (categoriesRes.error) throw categoriesRes.error;
  if (ratingRes.error) throw ratingRes.error;

  const galleryImages = galleryRes.data?.map((img) => img.image_url) || [];
  const categories = categoriesRes.data ?? [];
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const breadcrumbs: { id: string; name: string; slug: string; parent_id: string | null }[] = [];
  let mainCategoryId: string | null = product.category_id;
  const breadcrumbIds = new Set<string>();

  while (mainCategoryId && !breadcrumbIds.has(mainCategoryId)) {
    breadcrumbIds.add(mainCategoryId);
    const category = categoryById.get(mainCategoryId);
    if (!category) break;
    breadcrumbs.unshift(category);
    mainCategoryId = category.parent_id;
  }

  const mainCategory = breadcrumbs[0];
  const mainCategoryIds = mainCategory
    ? categories.reduce<string[]>((ids, category) => {
        let currentCategory = category;
        const visited = new Set<string>();

        while (!visited.has(currentCategory.id)) {
          if (currentCategory.id === mainCategory.id) {
            ids.push(category.id);
            break;
          }
          visited.add(currentCategory.id);
          const parent = currentCategory.parent_id
            ? categoryById.get(currentCategory.parent_id)
            : undefined;
          if (!parent) break;
          currentCategory = parent;
        }

        return ids;
      }, [])
    : [];

  const { data: relatedProducts, error: relatedError } = mainCategoryIds.length > 0
    ? await supabase
        .from('products')
        .select('id, name, slug, regular_price, sale_price, main_image, brand, is_featured, track_inventory, stock_quantity, stock_status, product_type, product_condition')
        .in('category_id', mainCategoryIds)
        .eq('is_active', true)
        .neq('id', product.id)
        .limit(8)
    : { data: [], error: null };

  if (relatedError) throw relatedError;

  const similarProducts = relatedProducts ?? [];
  const ratings = ratingRes.data || [];
  const relatedReviewSummaries = await fetchReviewSummaries(
    supabase,
    similarProducts.map((related) => related.id)
  );

  const avgRating = ratings.length > 0
    ? Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) * 10) / 10
    : 0;

  const hasDiscount = isDiscountedPrice(product.regular_price, product.sale_price);
  const currentPrice = getCurrentProductPrice(product.regular_price, product.sale_price);
  const discountPercentage = hasDiscount 
    ? Math.round((1 - (product.sale_price ?? 0) / (product.regular_price ?? 1)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6 flex-wrap">
          <Link href="/" className="hover:text-[#1E3A5F] transition-colors">Ana Sayfa</Link>
          {breadcrumbs.map((cat, index) => (
            <span key={cat.id} className="flex items-center gap-2">
              <span className="text-gray-400">›</span>
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-900 font-medium">{cat.name}</span>
              ) : (
                <Link href={`/category/${cat.slug}`} className="hover:text-[#1E3A5F] transition-colors">{cat.name}</Link>
              )}
            </span>
          ))}
          <span className="text-gray-400">›</span>
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <ProductGallery 
            mainImage={product.main_image}
            galleryImages={galleryImages}
            productName={product.name}
            hasDiscount={hasDiscount}
            discountPercentage={discountPercentage}
            productCondition={product.product_condition}
          />

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {product.is_featured && (
                  <span className="px-3 py-1 bg-gradient-to-r from-[#E8B04B] to-[#F5C06B] text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Öne Çıkan
                  </span>
                )}
                {hasDiscount && (
                  <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">İndirim</span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">{product.name}</h1>
              {product.brand && (
                <p className="text-gray-600 mb-4 flex items-center gap-2">
                  <span className="text-gray-400">Marka:</span>
                  <span className="font-semibold text-gray-900">{product.brand}</span>
                </p>
              )}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className={`w-5 h-5 ${star <= Math.round(avgRating) ? 'text-[#E8B04B] fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {avgRating > 0 ? `${avgRating} (${ratings.length} değerlendirme)` : 'Henüz değerlendirme yok'}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              {hasDiscount ? (
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-4xl font-bold text-red-600">₺{product.sale_price}</span>
                  <span className="text-xl text-gray-400 line-through">₺{product.regular_price}</span>
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-bold rounded-md">%{discountPercentage} İndirim</span>
                </div>
              ) : currentPrice !== null ? (
                <div className="text-4xl font-bold text-[#1E3A5F]">₺{currentPrice}</div>
              ) : (
                <div className="text-lg font-medium text-gray-500">Fiyat bilgisi yok</div>
              )}
              <p className="text-xs text-gray-500 mt-2">KDV Dahil • {STORE_SHIPPING.freeShippingMinimum.toLocaleString('tr-TR')} TL ve üzeri kargo ücretsiz</p>
            </div>

            {product.short_description && (
              <div className="border-l-4 border-[#E8B04B] pl-4 py-1 bg-yellow-50/50 rounded-r-lg">
                <p className="text-gray-700 text-base leading-relaxed">{product.short_description}</p>
              </div>
            )}

            {product.track_inventory && (
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${product.stock_status === 'in_stock' ? 'bg-green-500' : product.stock_status === 'out_of_stock' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                <span className={`text-sm font-medium ${product.stock_status === 'in_stock' ? 'text-green-700' : product.stock_status === 'out_of_stock' ? 'text-red-700' : 'text-yellow-700'}`}>
                  {product.stock_status === 'in_stock' && `Stokta Var (${product.stock_quantity} adet)`}
                  {product.stock_status === 'out_of_stock' && 'Tükendi'}
                </span>
              </div>
            )}

            <AddToCartButton product={product} />

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center text-center p-3 bg-white rounded-xl border border-gray-100">
                <Truck className="w-5 h-5 text-[#1E3A5F] mb-1" />
                <span className="text-xs font-medium text-gray-700">Hızlı Teslimat</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-white rounded-xl border border-gray-100">
                <MessageCircle className="w-5 h-5 text-[#1E3A5F] mb-1" />
                <span className="text-xs font-medium text-gray-700">WhatsApp ile Sipariş Onayı</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-white rounded-xl border border-gray-100">
                <RotateCcw className="w-5 h-5 text-[#1E3A5F] mb-1" />
                <span className="text-xs font-medium text-gray-700">{STORE_RETURN_WINDOW_DAYS} Gün İçinde İade</span>
              </div>
            </div>
          </div>
        </div>

        {product.description && (
          <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-[#1E3A5F] rounded-full"></div>
              Ürün Açıklaması
            </h2>
            <div className="prose max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
              {product.description}
            </div>
          </div>
        )}

        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-1 h-6 bg-[#1E3A5F] rounded-full"></div>
            Müşteri Değerlendirmeleri
          </h2>
          <ProductReviewsSection productId={product.id} initialReviews={ratings} />
        </div>

        {similarProducts.length > 0 && (
          <section className="mt-10 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:mt-12 sm:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Benzer Ürünler</h2>
              <p className="mt-1 text-sm text-gray-500">Bu ürünle aynı kategorideki diğer seçenekler</p>
            </div>
            <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-3 [scrollbar-width:thin] sm:gap-4">
              {similarProducts.map((related) => (
                <div key={related.id} className="w-[210px] shrink-0 snap-start sm:w-[230px]">
                  <ProductCard
                    product={related}
                    reviewSummary={
                      relatedReviewSummaries[related.id] ?? { averageRating: 0, reviewCount: 0 }
                    }
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-[#1E3A5F] hover:text-[#1A3354] font-medium transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>
      </div>
    </div>
  );
}