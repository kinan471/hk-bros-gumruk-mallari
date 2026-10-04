'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import ProductCard from './ProductCard';

interface ProductsGridProps {
  categorySlug?: string;
  initialLimit?: number;
}

export default function ProductsGrid({ categorySlug, initialLimit = 12 }: ProductsGridProps) {
  const supabase = createClient();
  const [hasMore, setHasMore] = useState(true);

  // جلب المنتجات بشكل لانهائي مع Pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['products', categorySlug],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('products')
        .select('*, categories(name)', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(pageParam * initialLimit, (pageParam + 1) * initialLimit - 1);

      if (categorySlug) {
        query = query.eq('category_slug', categorySlug);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      
      return {
        items: data,
        totalCount: count || 0,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length;
      const totalItems = nextPage * initialLimit;
      return totalItems < lastPage.totalCount ? nextPage : undefined;
    },
    initialPageParam: 0,
  });

  // Infinite Scroll Observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse border border-gray-100">
            <div className="aspect-[4/3] sm:aspect-square bg-gray-200" />
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const allProducts = data?.pages.flatMap((page) => page.items) || [];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {allProducts.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Loading More Indicator */}
      <div ref={loadMoreRef} className="mt-8 text-center">
        {isFetchingNextPage && (
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A5F]" />
            <span>Ürünler yükleniyor...</span>
          </div>
        )}
      </div>

      {!hasNextPage && allProducts.length > 0 && (
        <div className="mt-8 text-center text-gray-500 text-sm">
          Tüm ürünler görüntülendi
        </div>
      )}
    </>
  );
}