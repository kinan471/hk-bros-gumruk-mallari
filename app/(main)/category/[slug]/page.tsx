import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import { fetchReviewSummaries } from '@/lib/utils/reviewSummaries';
import { FolderOpen } from 'lucide-react';

export const revalidate = 60;

type CategoryBreadcrumb = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
};

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!category) notFound();

  const { data: allCategories } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id')
    .eq('is_active', true);

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
    .select('id, name, slug, brand, regular_price, sale_price, main_image, is_featured, track_inventory, stock_quantity, stock_status, product_type, product_condition, is_on_sale, categories(name, slug)')
    .in('category_id', allCategoryIds)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const subcategories = allCategories?.filter(c => c.parent_id === category.id) || [];

  const reviewSummaries = await fetchReviewSummaries(
    supabase,
    (products ?? []).map((product) => product.id)
  );
  const breadcrumbs: CategoryBreadcrumb[] = [];
  let currentId: string | null = category.id;
  const categoryMap = new Map<string, CategoryBreadcrumb>(
    allCategories?.map((cat): [string, CategoryBreadcrumb] => [cat.id, cat]) ?? []
  );

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
    <div className="min-h-screen bg-[#e3e6e6]">
      <div className="mx-auto max-w-[1440px] px-3 py-5 sm:px-6 sm:py-7">
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

      <div className="mb-6 rounded-xl bg-gradient-to-r from-[#1b3446] to-[#39766e] p-7 text-white sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">{category.name}</h1>
        {category.description && <p className="text-lg text-gray-200 max-w-2xl">{category.description}</p>}
        <p className="text-sm text-gray-300 mt-4">{products?.length || 0} ürün bulundu</p>
      </div>

      {subcategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-[#1E3A5F]" />
            Alt Kategoriler
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {subcategories.map((subcat) => (
              <Link key={subcat.id} href={`/category/${subcat.slug}`} className="bg-white rounded-xl p-6 border border-gray-100 hover:border-[#1E3A5F] hover:shadow-md transition-all text-center group">
                <h3 className="font-semibold text-gray-900 text-sm group-hover:text-[#1E3A5F] transition-colors">{subcat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}

      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 sm:gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              reviewSummary={reviewSummaries[product.id] ?? { averageRating: 0, reviewCount: 0 }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500 text-lg">Bu kategoride henüz ürün bulunmamaktadır</p>
        </div>
      )}
      </div>
    </div>
  );
}