import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import ProductCard from '@/components/products/ProductCard';
import HeroSlider from '@/components/layout/HeroSlider';
import { fetchReviewSummaries } from '@/lib/utils/reviewSummaries';
import Link from 'next/link';
import { ChevronRight, Star, TrendingUp } from 'lucide-react';

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
      .order('display_order')
      .limit(6),
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
          <div className="grid grid-cols-2 justify-items-start gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group relative aspect-[4/3] w-full max-w-[130px] overflow-hidden rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#4A90A4] shadow-sm transition-all duration-300 hover:shadow-xl sm:max-w-[180px] sm:rounded-2xl md:max-w-none"
              >
                {category.image_url && (
                  <Image
                    src={category.image_url}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 130px, (max-width: 768px) 180px, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2 sm:p-4">
                  <h3 className="font-bold text-white text-[11px] sm:text-sm lg:text-base drop-shadow-sm group-hover:text-[#F5C06B] transition-colors">
                    {category.name}
                  </h3>
                  <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-semibold text-white/80 transition-colors group-hover:text-white sm:mt-2 sm:text-xs">
                    Ürünleri keşfet <ChevronRight className="w-3.5 h-3.5" />
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