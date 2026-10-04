import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/products/ProductCard';
import HeroSlider from '@/components/layout/HeroSlider';
import Link from 'next/link';
import { ChevronRight, Star, Zap, TrendingUp } from 'lucide-react';

// ✅ هذا السطر وحده لا يكفي، يجب إجبار الكاش في الاستعلام نفسه
export const dynamic = 'force-static'; 
export const revalidate = 3600; // حفظ الصفحة لمدة ساعة كاملة (أسرع بكثير)

export const metadata = {
  title: 'HK BROS GÜMRÜK MALLARI',
  description: 'En kaliteli ürünler, en uygun fiyatlar.',
};

export default async function HomePage() {
  const supabase = await createClient();

  // ✅ إجبار Next.js على استخدام الكاش وعدم الاتصال بقاعدة البيانات في كل زيارة
  const fetchOptions = {
    cache: 'force-cache' as const,
    next: { revalidate: 3600 }
  };

  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_featured', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8)
    .options(fetchOptions); // تطبيق الكاش هنا

  const { data: latestProducts } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8)
    .options(fetchOptions);

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .eq('parent_id', null)
    .order('display_order')
    .limit(6)
    .options(fetchOptions);

  return (
    <div className="min-h-screen">
      <HeroSlider />
      
      {/* باقي الكود كما هو، تم اختصاره هنا للوضوح */}
      {/* تأكد من أن HeroSlider يستخدم next/image مع priority={true} للصورة الأولى */}
      
      {latestProducts && latestProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1E3A5F] to-[#4A90A4] rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Yeni Ürünler</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {latestProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}