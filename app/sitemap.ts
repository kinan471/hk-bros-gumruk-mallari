import type { MetadataRoute } from 'next';
import { createPublicServerClient } from '@/lib/supabase/public-server';

export const revalidate = 3600;

const PAGE_SIZE = 1000;

function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!configuredUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is required to generate the sitemap.');
  }
  return new URL(configuredUrl).origin;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicServerClient();
  const [products, categories] = await Promise.all([
    (async () => {
      const rows: { slug: string; updated_at: string | null }[] = [];
      for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await supabase
          .from('products')
          .select('slug, updated_at')
          .eq('is_active', true)
          .order('slug', { ascending: true })
          .range(from, from + PAGE_SIZE - 1);
        if (error) throw error;
        rows.push(...(data ?? []));
        if (!data || data.length < PAGE_SIZE) return rows;
      }
    })(),
    (async () => {
      const rows: { slug: string; updated_at: string | null }[] = [];
      for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await supabase
          .from('categories')
          .select('slug, updated_at')
          .eq('is_active', true)
          .order('slug', { ascending: true })
          .range(from, from + PAGE_SIZE - 1);
        if (error) throw error;
        rows.push(...(data ?? []));
        if (!data || data.length < PAGE_SIZE) return rows;
      }
    })(),
  ]);

  const siteUrl = getSiteUrl();
  const staticPaths = [
    '/',
    '/products',
    '/about',
    '/contact',
    '/faq',
  ];

  return [
    ...staticPaths.map((path) => ({
      url: new URL(path, siteUrl).toString(),
      changeFrequency: path === '/' ? 'daily' as const : 'monthly' as const,
      priority: path === '/' ? 1 : 0.6,
    })),
    ...categories.map((category) => ({
      url: new URL(`/category/${encodeURIComponent(category.slug)}`, siteUrl).toString(),
      lastModified: category.updated_at ?? undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: new URL(`/products/${encodeURIComponent(product.slug)}`, siteUrl).toString(),
      lastModified: product.updated_at ?? undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
