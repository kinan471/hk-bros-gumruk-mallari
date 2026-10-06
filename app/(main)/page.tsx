import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import ProductCard from '@/components/products/ProductCard';
import HeroSlider from '@/components/layout/HeroSlider';
import { fetchReviewSummaries } from '@/lib/utils/reviewSummaries';
import Link from 'next/link';
import { Star, TrendingUp } from 'lucide-react';

export const dynamic = 'force-static';
export const revalidate = 120;

export const metadata = {
  title: 'HK BROS GÜMRÜK MALLARI',
  description: 'En kaliteli ürünler, en uygun fiyatlar.',
};

export default async function HomePage() {
  const supabase = await createClient();

  const productFields = 'id, name, slug, main_image, regular_price, sale_price, is_featured, track_inventory, stock_quantity, stock_status, product_condition, brand, product_type, created_at';
  const [featuredResult, latestResult, categoriesResult] = await Promise.all([
    supabase
      .from('products')
      .select(productFields)
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('products')
      .select(productFields)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('categories')
      .select('id, name, slug, image_url')
      .eq('is_active', true)
      .is('parent_id', null)
      .order('display_order'),
  ]);

  const featuredProducts = featuredResult.data ?? [];
  const latestProducts = latestResult.data ?? [];
  const categories = categoriesResult.data ?? [];
  const reviewSummaries = await fetchReviewSummaries(supabase, [
    ...featuredProducts.map((product) => product.id),
    ...latestProducts.map((product) => product.id),
  ]);

  return (
    <div className="min-h-screen">
      <HeroSlider />
      
 {categories.length > 0 && (
  <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
    <div
      role="region"
      aria-label="Kategoriler"
      className="flex gap-4 overflow-x-auto pb-4 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6"
    >
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/category/${category.slug}`}
          className="group flex flex-col items-center min-w-[90px] max-w-[100px] sm:min-w-[110px] sm:max-w-[120px] flex-none"
        >
          {/* Görsel Konteyneri */}
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 border border-gray-200/80 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-hover:border-gray-300">
            {category.image_url ? (
              <Image
                src={category.image_url}
                alt={category.name}
                fill
                sizes="(max-width: 640px) 100px, 120px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-400">
                Görsel Yok
              </div>
            )}
            
            {/* Soft Overlay */}
            <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
          </div>

          {/* Kategori Adı */}
          <div className="mt-2.5 w-full text-center">
            <h3 className="truncate text-xs sm:text-sm font-semibold text-gray-800 transition-colors duration-200 group-hover:text-gray-900">
              {category.name}
            </h3>
            <span className="mt-0.5 block truncate text-[10px] sm:text-xs font-medium text-gray-600 transition-colors group-hover:text-amber-600">
              Keşfet &rarr;
            </span>
          </div>
        </Link>
      ))}
    </div>
  </section>
)}

      {featuredProducts.length > 0 && (
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
                <ProductCard key={product.id} product={product} reviewSummary={reviewSummaries[product.id]} />
              ))}
            </div>
          </div>
        </section>
      )}

      {latestProducts.length > 0 && (
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
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {latestProducts.map((product) => (
                <ProductCard key={product.id} product={product} reviewSummary={reviewSummaries[product.id]} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}