import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/products/ProductCard';
import HeroSlider from '@/components/layout/HeroSlider';
import Link from 'next/link';
import { 
  ChevronRight, Star, Zap, Gift, TrendingUp,
} from 'lucide-react';

export const metadata = {
  title: 'HK BROS GÜMRÜK MALLARI - En Kaliteli Ürünler',
  description: 'Elektronik, giyim, kozmetik ve daha fazlası. En uygun fiyatlarla kapınıza teslim.',
};

export default async function HomePage() {
  const supabase = await createClient();

  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8);

  const { data: saleProducts } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .not('sale_price', 'is', null)
    .order('created_at', { ascending: false })
    .limit(8);

  const { data: latestProducts } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8);

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .eq('parent_id', null)
    .order('display_order')
    .limit(6);

  return (
    <div className="min-h-screen">
      {/* === HERO SLIDER === */}
      <HeroSlider />

      {/* === CATEGORIES === */}
      {categories && categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Kategoriler</h2>
              <p className="text-gray-500 mt-1">İlgi alanınıza göre alışveriş yapın</p>
            </div>
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1 text-[#1E3A5F] font-semibold hover:gap-2 transition-all"
            >
              Tümünü Gör <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-end p-4">
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-[#E8B04B] transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </div>
                <div className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-4 h-4 text-white" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* === FEATURED PRODUCTS === */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="bg-gradient-to-b from-gray-50 to-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#E8B04B] to-[#F5C06B] rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-white fill-current" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Öne Çıkan Ürünler</h2>
                  <p className="text-gray-500 mt-1">En çok tercih edilen ürünler</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* === SALE BANNER === */}
      {saleProducts && saleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-3xl overflow-hidden p-8 sm:p-12">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
            </div>
            
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-white text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
                  <Zap className="w-6 h-6 fill-current" />
                  <span className="text-sm font-bold uppercase tracking-wider">Sınırlı Süre</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-2">Büyük İndirim Fırsatı</h2>
                <p className="text-white/90 text-lg">Seçili ürünlerde %50'ye varan indirimler</p>
              </div>
              <Link
                href="/search?q=indirim"
                className="flex-shrink-0 bg-white text-red-600 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all shadow-2xl hover:scale-105 flex items-center gap-2"
              >
                <Gift className="w-5 h-5" />
                İndirimleri Gör
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* === SALE PRODUCTS === */}
      {saleProducts && saleProducts.length > 0 && (
        <section className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">İndirimli Ürünler</h2>
                <p className="text-gray-500 mt-1">Kaçırılmayacak fırsatlar</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {saleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

{/* === LATEST PRODUCTS === */}
{latestProducts && latestProducts.length > 0 && (
  <section className="bg-gradient-to-b from-white to-gray-50 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#1E3A5F] to-[#4A90A4] rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Yeni Ürünler</h2>
            <p className="text-gray-500 mt-1">En son eklenen ürünler</p>
          </div>
        </div>
        <Link
          href="/products"
          className="hidden sm:inline-flex items-center gap-2 bg-[#1E3A5F] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#1A3354] transition-all hover:scale-105 shadow-md"
        >
          Tüm Ürünleri Gör
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {latestProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Mobile Button */}
      <div className="sm:hidden mt-6 text-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-[#1E3A5F] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1A3354] transition-all shadow-md"
        >
          Tüm Ürünleri Gör
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  </section>
)}

      {/* === CTA BANNER === */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-br from-[#1E3A5F] to-[#4A90A4] rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full" />
            <div className="absolute bottom-10 right-10 w-48 h-48 border-2 border-white rounded-full" />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 border border-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Özel Fırsatları Kaçırma!
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Yeni ürünler ve özel indirimlerden ilk sen haberdar ol. WhatsApp üzerinden bize ulaş, sana özel teklifler sunalım.
            </p>
            <a
              href="https://wa.me/905551234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-8 py-4 rounded-full font-bold hover:bg-[#20BA56] transition-all shadow-2xl hover:scale-105"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp'tan Yaz
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}