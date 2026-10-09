import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { fetchReviewSummaries } from '@/lib/utils/reviewSummaries';
import ProductCard from '@/components/products/ProductCard';
import HeroSlider from '@/components/layout/HeroSlider';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Sparkles, Star } from 'lucide-react';
import type { ProductCardProduct } from '@/types/database';
import type { ReviewSummary } from '@/lib/utils/reviewSummaries';

type HomeProduct = ProductCardProduct & {
  category_id: string | null;
  created_at: string;
};

interface ProductRailProps {
  title: string;
  subtitle: string;
  products: HomeProduct[];
  reviewSummaries: Record<string, ReviewSummary>;
  icon: 'featured' | 'latest';
}

function ProductRail({ title, subtitle, products, reviewSummaries, icon }: ProductRailProps) {
  if (products.length === 0) return null;

  const Icon = icon === 'featured' ? Star : Sparkles;

  return (
    <section className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#edf4f3] text-[#246b65]">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">{title}</h2>
            <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>
        <Link
          href="/products"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#1e5362] hover:underline"
        >
          Tümünü gör
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-3 [scrollbar-width:thin] sm:gap-4">
        {products.map((product) => (
          <div key={product.id} className="w-[210px] shrink-0 sm:w-[230px]">
            <ProductCard
              product={product}
              reviewSummary={reviewSummaries[product.id] ?? { averageRating: 0, reviewCount: 0 }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export const dynamic = 'force-static';
export const revalidate = 120;

export const metadata = {
  title: 'HK BROS GÜMRÜK MALLARI',
  description: 'En kaliteli ürünler, en uygun fiyatlar.',
};

export default async function HomePage() {
  const supabase = await createClient();

  const [featuredRes, latestRes, categoriesRes] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, slug, brand, main_image, regular_price, sale_price, is_featured, track_inventory, stock_quantity, stock_status, product_type, product_condition, category_id, created_at')
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('products')
      .select('id, name, slug, brand, main_image, regular_price, sale_price, is_featured, track_inventory, stock_quantity, stock_status, product_type, product_condition, category_id, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('categories')
      .select('id, name, slug, image_url')
      .eq('is_active', true)
      .is('parent_id', null)
      .order('display_order')
      .limit(8),
  ]);

  if (featuredRes.error) throw featuredRes.error;
  if (latestRes.error) throw latestRes.error;
  if (categoriesRes.error) throw categoriesRes.error;

  const featuredProducts = (featuredRes.data ?? []) as HomeProduct[];
  const latestProducts = (latestRes.data ?? []) as HomeProduct[];
  const categories = categoriesRes.data ?? [];
  const reviewSummaries = await fetchReviewSummaries(
    supabase,
    [...featuredProducts, ...latestProducts].map((product) => product.id)
  );

  return (
    <div className="min-h-screen bg-[#e3e6e6] pb-8">
      <HeroSlider />

      <div className="mx-auto max-w-[1440px] space-y-5 px-3 sm:px-6">
        {categories.length > 0 && (
          <section className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#39766e]">Alışverişe başla</p>
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Kategorilere göz at</h2>
              </div>
              <Link href="/products" className="inline-flex items-center gap-1 text-sm font-semibold text-[#1e5362] hover:underline">
                Tüm kategoriler
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-3 [scrollbar-width:thin]">
              {categories.map((category) => {
                const categoryProduct = latestProducts.find((product) => product.category_id === category.id);
                const imageUrl = category.image_url || categoryProduct?.main_image;

                return (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="group w-[155px] shrink-0 snap-start overflow-hidden rounded-lg border border-gray-100 bg-white transition hover:-translate-y-0.5 hover:border-[#9bbcb6] hover:shadow-md sm:w-[185px]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#edf3f2] to-[#f7f2e9]">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={category.name}
                          fill
                          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 150px"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-3 text-center text-2xl font-bold text-[#39766e]/60">
                          {category.name.slice(0, 1)}
                        </div>
                      )}
                    </div>
                    <p className="line-clamp-2 min-h-12 px-3 py-2.5 text-sm font-semibold text-gray-800 group-hover:text-[#1e5362]">
                      {category.name}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <ProductRail
          title="Öne çıkan ürünler"
          subtitle="Mağazamızdan sizin için seçtiklerimiz"
          products={featuredProducts}
          reviewSummaries={reviewSummaries}
          icon="featured"
        />

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/search?q=indirim"
            className="group flex min-h-36 items-center justify-between overflow-hidden rounded-xl bg-gradient-to-r from-[#fff0d6] to-[#ffe1b2] p-5 sm:p-7"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#95611b]">Fırsatları kaçırma</p>
              <h2 className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">İndirimli ürünleri keşfet</h2>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#80520f]">
                Alışverişe başla <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </div>
            <span className="pr-2 text-5xl font-black text-[#bc8129]/30 sm:text-6xl">%</span>
          </Link>
          <Link
            href="/siparis-takip"
            className="group flex min-h-36 items-center justify-between overflow-hidden rounded-xl bg-gradient-to-r from-[#dcece8] to-[#c5ded8] p-5 sm:p-7"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#39766e]">Siparişini takip et</p>
              <h2 className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">Her şey yolunda mı?</h2>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#285a54]">
                Sipariş durumunu gör <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </div>
            <span className="pr-2 text-5xl font-black text-[#39766e]/20 sm:text-6xl">HK</span>
          </Link>
        </section>

        <ProductRail
          title="Yeni gelenler"
          subtitle="En son eklenen ürünler"
          products={latestProducts}
          reviewSummaries={reviewSummaries}
          icon="latest"
        />
      </div>
    </div>
  );
}
