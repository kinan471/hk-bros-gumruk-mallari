'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/products/ProductCard';
import Link from 'next/link';
import { Search as SearchIcon, ArrowLeft, Loader2, Tag } from 'lucide-react';
import type { ProductCardProduct } from '@/types/database';
import type { ReviewSummary } from '@/lib/utils/reviewSummaries';

type SearchProduct = ProductCardProduct & {
  short_description: string | null;
  is_active: boolean;
  created_at: string;
  category_id: string | null;
  categories: { name: string; slug: string }[] | null;
  reviewSummary: ReviewSummary;
};

export default function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  return <SearchResults key={query} query={query} router={router} />;
}

function SearchResults({
  query,
  router,
}: {
  query: string;
  router: ReturnType<typeof useRouter>;
}) {
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchInput, setSearchInput] = useState(query);
  const [isSaleSearch, setIsSaleSearch] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) return;

    const controller = new AbortController();
    const fetchResults = async () => {
      setLoading(true);
      setErrorMessage('');
      setIsSaleSearch(false);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}&mode=results`,
          { signal: controller.signal }
        );
        const payload = await response.json() as {
          results?: SearchProduct[];
          isSaleSearch?: boolean;
          error?: string;
        };
        if (!response.ok) {
          throw new Error(payload.error || `Search request failed with status ${response.status}.`);
        }
        setIsSaleSearch(payload.isSaleSearch === true);
        setProducts(payload.results ?? []);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Search error:', error);
        setProducts([]);
        setErrorMessage(error instanceof Error ? error.message : 'Arama sırasında bir hata oluştu.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void fetchResults();
    return () => controller.abort();
  }, [query]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedQuery = searchInput.trim();
    if (trimmedQuery) router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  };

  return (
    <div className="min-h-screen bg-[#e3e6e6]">
      <div className="mx-auto max-w-[1440px] px-3 py-5 sm:px-6 sm:py-7">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Arama Sonuçları</h1>
          {query && (
            <p className="text-gray-600">
              {isSaleSearch ? (
                <span className="inline-flex items-center gap-2">
                  <Tag className="h-4 w-4 text-red-500" />
                  İndirimli ürünler - {products.length} sonuç bulundu
                </span>
              ) : (
                `"${query}" için ${products.length} sonuç bulundu`
              )}
            </p>
          )}
        </div>

        <form onSubmit={handleSearch} className="relative mb-8">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Ürün ara..."
            maxLength={80}
            className="w-full rounded-xl border-2 border-gray-200 bg-white py-4 pl-12 pr-24 text-lg outline-none focus:border-[#1E3A5F]"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[#1E3A5F] px-6 py-2 text-white transition-colors hover:bg-[#1A3354]"
          >
            Ara
          </button>
        </form>

        {query ? (
          loading ? (
            <div className="flex flex-col items-center justify-center py-16" aria-live="polite">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-[#1E3A5F]" />
              <p className="text-gray-600">Aranıyor...</p>
            </div>
          ) : errorMessage ? (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
              {errorMessage}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  reviewSummary={product.reviewSummary}
                  preload={index === 0}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-100 bg-white py-12 text-center">
              <SearchIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h2 className="mb-2 text-xl font-semibold text-gray-900">Sonuç Bulunamadı</h2>
              <p className="mb-6 text-gray-600">&quot;{query}&quot; için herhangi bir ürün bulunamadı</p>
              <Link href="/" className="inline-flex items-center gap-2 font-medium text-[#1E3A5F] hover:text-[#1A3354]">
                <ArrowLeft className="h-5 w-5" />
                <span>Ana Sayfaya Dön</span>
              </Link>
            </div>
          )
        ) : (
          <div className="rounded-xl border border-gray-100 bg-white py-12 text-center">
            <SearchIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h2 className="mb-2 text-xl font-semibold text-gray-900">Arama Yapın</h2>
            <p className="text-gray-600">Ürün aramak için yukarıdaki arama kutusunu kullanın</p>
          </div>
        )}
      </div>
    </div>
  );
}
