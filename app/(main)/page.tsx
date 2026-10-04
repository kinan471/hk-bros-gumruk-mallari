import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/products/ProductCard';
import HeroSlider from '@/components/layout/HeroSlider';
import Link from 'next/link';
import { ChevronRight, Star, Zap, TrendingUp } from 'lucide-react';

// ✅ إجبار Next.js على بناء الصفحة بشكل ثابت (Static) وتحديثها كل ساعة (3600 ثانية)
// هذا هو السحر الحقيقي للأداء في Next.js App Router
export const dynamic = 'force-static';
export const revalidate = 120;

export const metadata = {
  title: 'HK BROS GÜMRÜK MALLARI',
  description: 'En kaliteli ürünler, en uygun fiyatlar.',
};

export default async function HomePage() {
  const supabase = await createClient();

  // ✅ استعلامات نظيفة وبسيطة. Next.js سيخزن نتائجها تلقائياً بسبب revalidate
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_featured', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8);

  const { data: latestProducts } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8);

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .eq('parent_id', null)
    .order('display_order')
    .limit(6);

  return (
    <div className="min-h-screen">
      <HeroSlider />
      
      {categories && categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Kategoriler</h2>
              <p className="text-gray-500 mt-1">İlgi alanınıza göre alışveriş yapın</p>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-1 text-[#1E3A5F] font-semibold hover:gap-2 transition-all">
              Tümünü Gör <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`} className="group relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-end p-4">
                  <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-[#E8B04B] transition-colors">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featuredProducts && featuredProducts.length > 0 && (
        <section className="bg-gradient-to-b from-gray-50 to-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-[#E8B04B] to-[#F5C06B] rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white fill-current" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Öne Çıkan Ürünler</h2>
                <p className="text-gray-500 mt-1">En çok tercih edilen ürünler</p>
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
              <Link href="/products" className="hidden sm:inline-flex items-center gap-2 bg-[#1E3A5F] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#1A3354] transition-all hover:scale-105 shadow-md">
                Tüm Ürünleri Gör <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {latestProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="sm:hidden mt-6 text-center">
              <Link href="/products" className="inline-flex items-center gap-2 bg-[#1E3A5F] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1A3354] transition-all shadow-md">
                Tüm Ürünleri Gör <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}