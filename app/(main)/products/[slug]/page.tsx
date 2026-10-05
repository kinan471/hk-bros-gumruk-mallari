import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Truck, Shield, RotateCcw, Star } from 'lucide-react';
import ProductReviewsSection from '@/components/products/ProductReviewsSection';
import ProductGallery from '@/components/products/ProductGallery';
import NextImage from 'next/image';

export const dynamic = 'force-static';
export const revalidate = 3600;

const getProductBySlug = cache(async (slug: string) => {
  const supabase = await createClient();
  return supabase
    .from('products')
    .select('id, name, slug, brand, regular_price, sale_price, short_description, description, track_inventory, stock_status, stock_quantity, product_type, weight, length, width, height, sku, main_image, is_featured, is_on_sale, category_id, product_condition')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
});

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const { data: product } = await getProductBySlug(slug);
    
  return {
    title: product ? `${product.name} - HK BROS` : 'Ürün Bulunamadı',
    description: product?.short_description || 'HK BROS Gümrük Malları',
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product, error } = await getProductBySlug(slug);

  if (error || !product) {
    notFound();
  }

  const [galleryRes, relatedRes, ratingRes] = await Promise.all([
    supabase.from('product_images').select('image_url').eq('product_id', product.id).order('display_order'),
    supabase.from('products').select('id, name, slug, regular_price, sale_price, main_image, is_on_sale').eq('category_id', product.category_id).eq('is_active', true).neq('id', product.id).limit(4),
    supabase.from('reviews').select('rating').eq('product_id', product.id).eq('is_approved', true)
  ]);

  const galleryImages = galleryRes.data?.map((img) => img.image_url) || [];
  const relatedProducts = relatedRes.data || [];
  const ratings = ratingRes.data || [];

  const avgRating = ratings.length > 0 
    ? Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) * 10) / 10 
    : 0;

  const hasDiscount = product.sale_price && product.sale_price < (product.regular_price || 0);
  const discountPercentage = hasDiscount 
    ? Math.round((1 - (product.sale_price || 0) / (product.regular_price || 1)) * 100) 
    : 0;

  const breadcrumbs: { id: string; name: string; slug: string; parent_id: string | null }[] = [];
  if (product.category_id) {
    const { data: allCats } = await supabase.from('categories').select('id, name, slug, parent_id');
    const catMap = new Map(allCats?.map(c => [c.id, c]));
    let currentId: string | null = product.category_id;
    while (currentId) {
      const currentCat = catMap.get(currentId);
      if (currentCat) {
        breadcrumbs.unshift(currentCat);
        currentId = currentCat.parent_id;
      } else {
        break;
      }
    }
  }

  const currentPrice = product.sale_price || product.regular_price || 0;
  const stockText = product.track_inventory 
    ? (product.stock_quantity > 0 ? `${product.stock_quantity} adet` : 'Tükendi') 
    : 'Stokta Var';
  
  const whatsappMessage = `Merhaba HK BROS, web sitenizdeki aşağıdaki ürün hakkında bilgi almak ve sipariş vermek istiyorum.%0A%0A` +
    `📦 *Ürün:* ${product.name}%0A` +
    `💰 *Fiyat:* ${currentPrice}%0A` +
    `📊 *Stok:* ${stockText}%0A` +
    `🏷️ *Durum:* ${product.product_condition || 'Belirtilmemiş'}%0A` +
    ` *Link:* https://hk-bros-gumruk-mallari.vercel.app/products/${product.slug}%0A%0A` +
    `Teşekkürler.`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
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
                {product.is_on_sale && (
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
              {product.sale_price ? (
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-4xl font-bold text-red-600">₺{product.sale_price}</span>
                  <span className="text-xl text-gray-400 line-through">₺{product.regular_price}</span>
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-bold rounded-md">%{discountPercentage} İndirim</span>
                </div>
              ) : (
                <div className="text-4xl font-bold text-[#1E3A5F]">₺{product.regular_price || '0'}</div>
              )}
              <p className="text-xs text-gray-500 mt-2">KDV Dahil • Ücretsiz Kargo</p>
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

            <a 
              href={`https://wa.me/905551234567?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/30 hover:scale-[1.02]"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span>WhatsApp ile Sipariş Ver</span>
            </a>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center text-center p-3 bg-white rounded-xl border border-gray-100">
                <Truck className="w-5 h-5 text-[#1E3A5F] mb-1" />
                <span className="text-xs font-medium text-gray-700">Hızlı Teslimat</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-white rounded-xl border border-gray-100">
                <Shield className="w-5 h-5 text-[#1E3A5F] mb-1" />
                <span className="text-xs font-medium text-gray-700">Güvenli Ödeme</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-white rounded-xl border border-gray-100">
                <RotateCcw className="w-5 h-5 text-[#1E3A5F] mb-1" />
                <span className="text-xs font-medium text-gray-700">Kolay İade</span>
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
          <ProductReviewsSection productId={product.id} />
        </div>

        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-[#1E3A5F] rounded-full"></div>
              Benzer Ürünler
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((related) => {
                const relHasDiscount = related.sale_price && related.sale_price < (related.regular_price || 0);
                return (
                  <Link key={related.id} href={`/products/${related.slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 hover:-translate-y-1">
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      <NextImage 
                        src={related.main_image} 
                        alt={related.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        sizes="25vw"
                        loading="lazy"
                      />
                      {relHasDiscount && (
                        <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">İndirim</span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2 group-hover:text-[#1E3A5F] transition-colors">{related.name}</h3>
                      <div className="flex items-baseline gap-2">
                        {relHasDiscount ? (
                          <><span className="font-bold text-red-600">₺{related.sale_price}</span><span className="text-xs text-gray-400 line-through">₺{related.regular_price}</span></>
                        ) : (
                          <span className="font-bold text-[#1E3A5F]">₺{related.regular_price || '0'}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
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