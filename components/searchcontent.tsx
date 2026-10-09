'use client';
import { useState, useEffect } from 'react';
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
  const [searchInput, setSearchInput] = useState(query);
  const [isSaleSearch, setIsSaleSearch] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) return;

    const controller = new AbortController();
    const fetchResults = async () => {
      setLoading(true);
      setIsSaleSearch(false);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}&mode=results`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error(`Search request failed with status ${response.status}.`);
        const payload = await response.json() as {
          results: SearchProduct[];
          isSaleSearch: boolean;
        };
        setIsSaleSearch(payload.isSaleSearch);
        setProducts(payload.results);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Search error:', error);
        setProducts([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void fetchResults();
    return () => controller.abort();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#e3e6e6]">
      <div className="mx-auto max-w-[1440px] px-3 py-5 sm:px-6 sm:py-7">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Arama Sonuçları</h1>
        {query && (
          <p className="text-gray-600">
            {isSaleSearch ? (
              <span className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-red-500" />
                İndirimli ürünler - {products.length} sonuç bulundu
              </span>
            ) : (
              `"${query}" için ${products.length} sonuç bulundu`
            )}
          </p>
        )}
      </div>

      <div className="mb-8">
        <form onSubmit={handleSearch} className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Ürün ara..."
            maxLength={80}
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-[#1E3A5F] focus:outline-none text-lg"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#1A3354] transition-colors"
          >
            Ara
          </button>
        </form>
      </div>

      {query ? (
        loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-[#1E3A5F] mb-4" />
            <p className="text-gray-600">Aranıyor...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 sm:gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                reviewSummary={product.reviewSummary}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sonuç Bulunamadı</h2>
            <p className="text-gray-600 mb-6">&quot;{query}&quot; için herhangi bir ürün bulunamadı</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[#1E3A5F] hover:text-[#1A3354] font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Ana Sayfaya Dön</span>
            </Link>
          </div>
        )
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Arama Yapın</h2>
          <p className="text-gray-600">Ürün aramak için yukarıdaki arama kutusunu kullanın</p>
        </div>
      )}
      </div>
    </div>
  );
}