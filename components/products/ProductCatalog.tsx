'use client';
import { useState, useMemo } from 'react';
import ProductCard from '@/components/products/ProductCard';
import Link from 'next/link';
import { Filter, SlidersHorizontal, Search, X, ArrowUpDown, TrendingUp, Package } from 'lucide-react';
import type { Category, ProductCardProduct } from '@/types/database';
import type { ReviewSummary } from '@/lib/utils/reviewSummaries';

type SortOption = 'newest' | 'price_low' | 'price_high' | 'rating';
export type ProductListItem = ProductCardProduct & {
  short_description: string | null;
  is_active: boolean;
  created_at: string;
  category_id: string | null;
  views_count: number;
  categories: { name: string; slug: string }[] | null;
  reviewSummary?: ReviewSummary;
};

export default function ProductCatalog({
  products,
  categories,
}: {
  products: ProductListItem[];
  categories: Category[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedCategory !== 'all') result = result.filter(p => p.category_id === selectedCategory);
    if (priceRange.min) result = result.filter(p => (p.sale_price || p.regular_price || 0) >= parseFloat(priceRange.min));
    if (priceRange.max) result = result.filter(p => (p.sale_price || p.regular_price || 0) <= parseFloat(priceRange.max));
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.short_description?.toLowerCase().includes(query)
      );
    }

    switch (sortBy) {
      case 'price_low': result.sort((a, b) => (a.sale_price || a.regular_price || 0) - (b.sale_price || b.regular_price || 0)); break;
      case 'price_high': result.sort((a, b) => (b.sale_price || b.regular_price || 0) - (a.sale_price || a.regular_price || 0)); break;
      case 'rating': result.sort((a, b) => (b.reviewSummary?.averageRating ?? 0) - (a.reviewSummary?.averageRating ?? 0)); break;
      default: result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [products, selectedCategory, priceRange, sortBy, searchQuery]);

  const clearFilters = () => {
    setSelectedCategory('all');
    setPriceRange({ min: '', max: '' });
    setSortBy('newest');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory !== 'all' || priceRange.min || priceRange.max || searchQuery;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-[#1E3A5F] transition-colors">Ana Sayfa</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Tüm Ürünler</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1E3A5F] to-[#4A90A4] rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Tüm Ürünler</h1>
              <p className="text-gray-500 mt-1">
                {`${filteredProducts.length} ürün listeleniyor`}
              </p>
            </div>
          </div>
        </div>

        {/* Search & Controls Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Ürün ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:border-[#1E3A5F] outline-none" />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X className="w-4 h-4" /></button>}
            </div>
            <div className="relative">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 font-medium text-gray-700 outline-none cursor-pointer min-w-[180px]">
                <option value="newest">En Yeni</option>
                <option value="price_low">Fiyat: Düşükten Yükseğe</option>
                <option value="price_high">Fiyat: Yüksekten Düşüğe</option>
                <option value="rating">En Çok Tercih Edilen</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="sm:hidden flex items-center justify-center gap-2 bg-[#1E3A5F] text-white px-4 py-3 rounded-xl font-medium">
              <SlidersHorizontal className="w-4 h-4" /> Filtreler
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block lg:col-span-1`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2"><Filter className="w-5 h-5 text-[#1E3A5F]" /> Filtreler</h3>
                {hasActiveFilters && <button onClick={clearFilters} className="text-xs text-[#1E3A5F] hover:underline font-medium">Temizle</button>}
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  <button onClick={() => setSelectedCategory('all')} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === 'all' ? 'bg-[#1E3A5F] text-white font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Tüm Kategoriler</button>
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat.id ? 'bg-[#1E3A5F] text-white font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>{cat.name}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fiyat Aralığı</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Min ₺" value={priceRange.min} onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" />
                  <input type="number" placeholder="Max ₺" value={priceRange.max} onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" />
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    reviewSummary={product.reviewSummary}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Ürün Bulunamadı</h2>
                <p className="text-gray-500 mb-6">Seçtiğiniz filtrelere uygun ürün bulunmuyor.</p>
                <button onClick={clearFilters} className="inline-flex items-center gap-2 text-[#1E3A5F] hover:text-[#1A3354] font-medium"><X className="w-4 h-4" /> Filtreleri Temizle</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}