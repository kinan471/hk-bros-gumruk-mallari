import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import Image from 'next/image';
import { ArrowUpRight, FolderOpen, Package } from 'lucide-react';
import { fetchReviewSummaries } from '@/lib/utils/reviewSummaries';

export const dynamic = 'force-static';
export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const [categoryResult, categoriesResult] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, slug, description, image_url')
      .eq('slug', slug)
      .eq('is_active', true)
      .single(),
    supabase
      .from('categories')
      .select('id, name, slug, parent_id, image_url')
      .eq('is_active', true),
  ]);

  const category = categoryResult.data;
  if (!category) notFound();

  const allCategories = categoriesResult.data;

  const allCategoryIds: string[] = [category.id];
  if (allCategories) {
    const collectSubcategoryIds = (parentId: string) => {
      const children = allCategories.filter(c => c.parent_id === parentId);
      children.forEach(child => {
        allCategoryIds.push(child.id);
        collectSubcategoryIds(child.id);
      });
    };
    collectSubcategoryIds(category.id);
  }

  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, regular_price, sale_price, main_image, is_featured, track_inventory, stock_quantity, stock_status, product_condition, brand, product_type, categories(name, slug)')
    .in('category_id', allCategoryIds)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const reviewSummaries = await fetchReviewSummaries(
    supabase,
    products?.map((product) => product.id) ?? []
  );
  const subcategories = allCategories?.filter(c => c.parent_id === category.id) || [];

  const breadcrumbs: NonNullable<typeof allCategories> = [];
  let currentId: string | null = category.id;
  const categoryMap = new Map(allCategories?.map(c => [c.id, c]));

  while (currentId) {
    const cat = categoryMap.get(currentId);
    if (cat) {
      breadcrumbs.unshift(cat);
      currentId = cat.parent_id;
    } else {
      break;
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6 flex-wrap">
        <Link href="/" className="hover:text-[#1E3A5F] transition-colors">Ana Sayfa</Link>
        {breadcrumbs.map((cat) => (
          <span key={cat.id} className="flex items-center gap-2">
            <span className="text-gray-400">›</span>
            {cat.id === category.id ? (
              <span className="text-gray-900 font-medium">{cat.name}</span>
            ) : (
              <Link href={`/category/${cat.slug}`} className="hover:text-[#1E3A5F] transition-colors">{cat.name}</Link>
            )}
          </span>
        ))}
      </nav>

      <div className="relative isolate mb-9 min-h-[210px] overflow-hidden rounded-3xl bg-[#1e3a5f] px-6 py-8 text-white sm:min-h-[270px] sm:px-10 sm:py-12">
        {category.image_url && (
          <Image
            src={category.image_url}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
            className="absolute inset-0 -z-10 object-cover"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#102237]/95 via-[#18324a]/75 to-[#18324a]/25" />
        <div className="flex min-h-[146px] max-w-2xl flex-col justify-end sm:min-h-[174px]">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">HK BROS · Koleksiyon</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">{category.name}</h1>
          {category.description && <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">{category.description}</p>}
          <p className="mt-5 text-sm font-medium text-white/80">{products?.length || 0} ürün</p>
        </div>
      </div>

      {subcategories.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight text-gray-950 sm:text-xl">
            <FolderOpen className="w-5 h-5 text-[#1E3A5F]" />
            Alt Kategoriler
          </h2>
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-4 pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:gap-4 sm:px-0">
            {subcategories.map((subcat, index) => (
              <Link key={subcat.id} href={`/category/${subcat.slug}`} className="group relative isolate flex min-h-[112px] w-[68vw] max-w-[190px] shrink-0 snap-start overflow-hidden rounded-xl border border-gray-200 bg-[#f3f1eb] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:min-h-[145px] sm:w-[220px] sm:max-w-none sm:rounded-2xl">
                {subcat.image_url ? (
                  <Image src={subcat.image_url} alt="" fill sizes="(max-width: 640px) 48vw, 25vw" className="absolute inset-0 -z-10 object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 -z-10 flex items-center justify-center bg-gradient-to-br from-[#eee9dc] to-[#dce4e4]">
                    <Package className="h-8 w-8 text-[#1E3A5F]/20 sm:h-10 sm:w-10" strokeWidth={1} />
                  </div>
                )}
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="mt-auto flex w-full items-end justify-between gap-2 p-2.5 text-white sm:p-4">
                  <div>
                    <span className="mb-0.5 block text-[9px] uppercase tracking-widest text-white/70 sm:mb-1 sm:text-[10px]">0{index + 1}</span>
                    <h3 className="text-xs font-semibold sm:text-base">{subcat.name}</h3>
                  </div>
                  <ArrowUpRight className="mb-0.5 h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {products && products.length > 0 ? (
        <div>
          <div className="mb-5 flex items-end justify-between border-b border-gray-200 pb-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Seçkimiz</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-gray-950">Bu koleksiyondaki ürünler</h2>
            </div>
            <span className="text-xs text-gray-500 sm:text-sm">{products.length} ürün</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} reviewSummary={reviewSummaries[product.id]} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500 text-lg">Bu kategoride henüz ürün bulunmamaktadır</p>
        </div>
      )}
    </div>
  );
}