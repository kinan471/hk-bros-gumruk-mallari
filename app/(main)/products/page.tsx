import { createClient } from '@/lib/supabase/server';
import ProductCatalog, { type ProductListItem } from '@/components/products/ProductCatalog';
import { fetchReviewSummaries } from '@/lib/utils/reviewSummaries';
import type { Category } from '@/types/database';

export const dynamic = 'force-static';
export const revalidate = 120;

export default async function AllProductsPage() {
  const supabase = await createClient();
  const [productsResult, categoriesResult] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, slug, brand, regular_price, sale_price, short_description, main_image, is_active, created_at, category_id, views_count, is_featured, track_inventory, stock_quantity, stock_status, product_condition, product_type, categories(name, slug)')
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .is('parent_id', null)
      .order('display_order'),
  ]);

  if (productsResult.error) throw productsResult.error;
  if (categoriesResult.error) throw categoriesResult.error;

  const products = productsResult.data ?? [];
  const reviewSummaries = await fetchReviewSummaries(
    supabase,
    products.map((product) => product.id)
  );
  const catalogProducts: ProductListItem[] = products.map((product) => ({
    ...product,
    reviewSummary: reviewSummaries[product.id],
  }));

  return (
    <ProductCatalog
      products={catalogProducts}
      categories={(categoriesResult.data ?? []) as Category[]}
    />
  );
}
