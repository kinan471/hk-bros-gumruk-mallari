import { unstable_cache } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { fetchReviewSummaries } from '@/lib/utils/reviewSummaries';

type SearchMode = 'suggestions' | 'results';

const getSearchData = unstable_cache(
  async (term: string, mode: SearchMode) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase public environment variables are required for search.');
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const isSaleSearch = mode === 'results' && ['indirim', 'sale', 'discount'].includes(term);
    let productQuery = supabase
      .from('products')
      .select('id, name, slug, brand, regular_price, sale_price, short_description, main_image, is_active, created_at, category_id, tags, is_featured, track_inventory, stock_quantity, stock_status, product_condition, product_type, categories(name, slug)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (isSaleSearch) {
      productQuery = productQuery.not('sale_price', 'is', null);
    } else {
      const searchTerm = `%${term}%`;
      productQuery = productQuery.or(
        `name.ilike.${searchTerm},` +
        `short_description.ilike.${searchTerm},` +
        `description.ilike.${searchTerm},` +
        `brand.ilike.${searchTerm}`
      );
    }

    const { data, error } = await productQuery.limit(mode === 'suggestions' ? 6 : 50);
    if (error) throw error;

    const results = data ?? [];
    const lowerQuery = term.toLowerCase();
    const tagMatches = results.filter(
      (product) => product.tags?.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
    );
    const existingIds = new Set(results.map((product) => product.id));
    tagMatches.forEach((product) => {
      if (!existingIds.has(product.id)) results.push(product);
    });

    if (mode === 'suggestions') return { results: results.slice(0, 6), isSaleSearch: false };

    const reviewSummaries = await fetchReviewSummaries(supabase, results.map((product) => product.id));
    return {
      results: results.map((product) => ({
        ...product,
        reviewSummary: reviewSummaries[product.id],
      })),
      isSaleSearch,
    };
  },
  ['product-search'],
  { revalidate: 60 }
);

export async function GET(request: Request) {
  const rawQuery = new URL(request.url).searchParams.get('q')?.trim().replace(/\s+/g, ' ');
  if (!rawQuery || rawQuery.length < 2 || rawQuery.length > 80 || !/^[\p{L}\p{N}\s-]+$/u.test(rawQuery)) {
    return Response.json({ error: 'Enter 2–80 letters or numbers to search.' }, { status: 400 });
  }

  const rawMode = new URL(request.url).searchParams.get('mode') ?? 'suggestions';
  if (rawMode !== 'suggestions' && rawMode !== 'results') {
    return Response.json({ error: 'Unsupported search mode.' }, { status: 400 });
  }

  const query = rawQuery.toLocaleLowerCase('tr-TR');
  const searchData = await getSearchData(query, rawMode);

  return Response.json(
    searchData,
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
  );
}
