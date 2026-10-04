'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import ProductCard from '@/components/products/ProductCard';
import Link from 'next/link';
import { Search as SearchIcon, ArrowLeft, Loader2, Tag } from 'lucide-react';
import { Product } from '@/types/database';

export default function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(query);
  const [isSaleSearch, setIsSaleSearch] = useState(false);

  useEffect(() => {
    if (!query) {
      setProducts([]);
      setIsSaleSearch(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setIsSaleSearch(false);

      try {
        const lowerQuery = query.toLowerCase().trim();

        // إذا كان البحث عن "indirim" أو "تخفيض" - اعرض المنتجات المخفضة
        if (lowerQuery === 'indirim' || lowerQuery === 'sale' || lowerQuery === 'discount') {
          setIsSaleSearch(true);
          const { data, error } = await supabase
            .from('products')
            .select('*, categories(name, slug)')
            .eq('is_active', true)
            .not('sale_price', 'is', null)
            .order('created_at', { ascending: false })
            .limit(50);

          if (error) throw error;
          setProducts(data || []);
          return;
        }

        // بحث عادي
        const searchTerm = `%${query}%`;
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name, slug)')
          .or(
            `name.ilike.${searchTerm},` +
            `short_description.ilike.${searchTerm},` +
            `description.ilike.${searchTerm},` +
            `brand.ilike.${searchTerm}`
          )
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        let filteredResults = data || [];
        if (query.length > 0) {
          const tagMatches = filteredResults.filter(
            (p: any) => p.tags?.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
          );
          const existingIds = new Set(filteredResults.map((p: any) => p.id));
          tagMatches.forEach((p: any) => {
            if (!existingIds.has(p.id)) {
              filteredResults.push(p);
              existingIds.add(p.id);
            }
          });
        }

        setProducts(filteredResults);
      } catch (error) {
        console.error('Search error:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, supabase]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchInput.trim())}`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sonuç Bulunamadı</h2>
            <p className="text-gray-600 mb-6">"{query}" için herhangi bir ürün bulunamadı</p>
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
  );
}