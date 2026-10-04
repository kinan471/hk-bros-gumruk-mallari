import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import { FolderOpen } from 'lucide-react';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. جلب الفئة الحالية
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!category) {
    notFound();
  }

  // 2. جلب جميع الفئات النشطة في استعلام واحد فقط
  const { data: allCategories } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, is_active')
    .eq('is_active', true);

  // 3. بناء شجرة الفئات في الذاكرة (سريع جداً)
  const categoryMap = new Map<string, any>();
  const allCategoryIds: string[] = [category.id];

  if (allCategories) {
    // بناء خريطة الفئات
    allCategories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // بناء الشجرة وجمع جميع معرفات الفئات الفرعية
    const collectSubcategoryIds = (parentId: string) => {
      const children = allCategories.filter(c => c.parent_id === parentId);
      children.forEach(child => {
        allCategoryIds.push(child.id);
        collectSubcategoryIds(child.id);
      });
    };

    collectSubcategoryIds(category.id);
  }

  // 4. جلب المنتجات من جميع الفئات في استعلام واحد
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .in('category_id', allCategoryIds)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // 5. جلب الفئات الفرعية المباشرة فقط
  const subcategories = allCategories?.filter(c => c.parent_id === category.id) || [];

  // 6. بناء Breadcrumb من الخريطة (بدون استعلامات إضافية)
  const breadcrumbs: any[] = [];
  let currentId: string | null = category.id;

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
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6 flex-wrap">
        <Link href="/" className="hover:text-[#1E3A5F] transition-colors">Ana Sayfa</Link>
        {breadcrumbs.map((cat) => (
          <span key={cat.id} className="flex items-center gap-2">
            <span className="text-gray-400">›</span>
            {cat.id === category.id ? (
              <span className="text-gray-900 font-medium">{cat.name}</span>
            ) : (
              <Link href={`/category/${cat.slug}`} className="hover:text-[#1E3A5F] transition-colors">
                {cat.name}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Category Header */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#4A90A4] rounded-2xl p-8 sm:p-12 mb-8 text-white">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">{category.name}</h1>
        {category.description && (
          <p className="text-lg text-gray-200 max-w-2xl">{category.description}</p>
        )}
        <p className="text-sm text-gray-300 mt-4">
          {products?.length || 0} ürün bulundu
        </p>
      </div>

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-[#1E3A5F]" />
            Alt Kategoriler
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {subcategories.map((subcat: any) => (
              <Link
                key={subcat.id}
                href={`/category/${subcat.slug}`}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:border-[#1E3A5F] hover:shadow-md transition-all text-center group"
              >
                <h3 className="font-semibold text-gray-900 text-sm group-hover:text-[#1E3A5F] transition-colors">
                  {subcat.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500 text-lg">Bu kategoride henüz ürün bulunmamaktadır</p>
        </div>
      )}
    </div>
  );
}