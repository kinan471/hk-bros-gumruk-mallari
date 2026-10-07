import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import ProductCard from '@/components/products/ProductCard';
import HeroSlider from '@/components/layout/HeroSlider';
import { fetchReviewSummaries } from '@/lib/utils/reviewSummaries';
import Link from 'next/link';
import { ArrowUpRight, Package, Star, TrendingUp } from 'lucide-react';
import type { Product } from '@/types/database';

type SliderProduct = Pick<
  Product,
  'id' | 'name' | 'slug' | 'main_image' | 'short_description' | 'is_on_sale' | 'sale_price' | 'regular_price'
>;

export const dynamic = 'force-static';
export const revalidate = 120;

export const metadata = {
  title: 'HK BROS GÜMRÜK MALLARI',
  description: 'En kaliteli ürünler, en uygun fiyatlar.',
};

export default async function HomePage() {
  const supabase = await createClient();

  const productFields = 'id, name, slug, main_image, regular_price, sale_price, is_featured, track_inventory, stock_quantity, stock_status, product_condition, brand, product_type, created_at';
  const [featuredResult, latestResult, categoriesResult, sliderResult] = await Promise.all([
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
    supabase
      .from('products')
      .select('id, name, slug, main_image, short_description, is_on_sale, sale_price, regular_price')
      .eq('is_slider', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const featuredProducts = featuredResult.data ?? [];
  const latestProducts = latestResult.data ?? [];
  const categories = categoriesResult.data ?? [];
  const sliderProducts = (sliderResult.data ?? []) as SliderProduct[];
  const reviewSummaries = await fetchReviewSummaries(supabase, [
    ...featuredProducts.map((product) => product.id),
    ...latestProducts.map((product) => product.id),
  ]);

  return (
    <div className="min-h-screen">
      <HeroSlider sliderProducts={sliderProducts} />
      
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12">
          <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8c6b32]">Koleksiyonları keşfet</p>
              <h2 className="text-xl font-semibold tracking-tight text-gray-950 sm:text-2xl">Alışverişe kategorilerden başlayın</h2>
            </div>
            <Link href="/products" className="hidden items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-gray-950 sm:inline-flex">
              Tüm ürünler <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group relative isolate flex min-h-[170px] overflow-hidden rounded-2xl border border-gray-200 bg-[#f3f1eb] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F] sm:min-h-[220px] lg:min-h-[250px]"
              >
                {category.image_url ? (
                  <Image
                    src={category.image_url}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 48vw, (max-width: 1024px) 32vw, 25vw"
                    className="absolute inset-0 -z-10 object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 -z-10 flex items-center justify-center bg-gradient-to-br from-[#eee9dc] via-[#f7f5f0] to-[#dce4e4]">
                    <Package className="h-12 w-12 text-[#1E3A5F]/20 transition-transform duration-500 group-hover:scale-110 sm:h-16 sm:w-16" strokeWidth={1} />
                  </div>
                )}
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="mt-auto flex w-full items-end justify-between gap-2 p-3 text-white sm:p-5">
                  <div className="min-w-0">
                    <span className="mb-1 block text-[10px] font-medium uppercase tracking-[0.15em] text-white/75">0{index + 1} / Koleksiyon</span>
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug sm:text-lg">{category.name}</h3>
                    <span className="mt-1 block text-[11px] text-white/75 sm:text-xs">Koleksiyonu keşfet</span>
                  </div>
                  <span className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/10 backdrop-blur-sm transition-all group-hover:bg-white group-hover:text-gray-950">
                    <ArrowUpRight className="h-4 w-4" />
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