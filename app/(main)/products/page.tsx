'use client';
import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import ProductCard from '@/components/products/ProductCard';
import { fetchReviewSummaries, type ReviewSummary } from '@/lib/utils/reviewSummaries';
import Link from 'next/link';
import { Filter, SlidersHorizontal, Search, Loader2, X, ArrowUpDown, TrendingUp, Package } from 'lucide-react';
import type { Category, ProductCardProduct } from '@/types/database';

type SortOption = 'newest' | 'price_low' | 'price_high' | 'rating';
type CatalogProduct = ProductCardProduct & {
  short_description: string | null;
  created_at: string;
  category_id: string | null;
  views_count: number;
  reviewSummary: ReviewSummary;
};

export default function AllProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<Pick<Category, 'id' | 'name' | 'slug'>[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          supabase
            .from('products')
            .select('id, name, slug, brand, regular_price, sale_price, short_description, main_image, is_featured, track_inventory, stock_quantity, stock_status, product_type, product_condition, is_active, created_at, category_id, views_count')
            .eq('is_active', true)
            .order('created_at', { ascending: false }),
          supabase
            .from('categories')
            .select('id, name, slug')
            .eq('is_active', true)
            .is('parent_id', null)
            .order('display_order')
        ]);

        if (productsRes.error) throw productsRes.error;
        if (categoriesRes.error) throw categoriesRes.error;

        const productData = productsRes.data ?? [];
        const reviewSummaries = await fetchReviewSummaries(
          supabase,
          productData.map((product) => product.id)
        );
        setProducts(productData.map((product) => ({
          ...product,
          reviewSummary: reviewSummaries[product.id] ?? { averageRating: 0, reviewCount: 0 },
        })));
        setCategories(categoriesRes.data ?? []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [supabase]);

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
      case 'rating': result.sort((a, b) => b.reviewSummary.averageRating - a.reviewSummary.averageRating); break;
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
    <div className="min-h-screen bg-[#e3e6e6]">
      <div className="mx-auto max-w-[1440px] px-3 py-5 sm:px-6 sm:py-7">
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
                {loading ? 'Ürünler yükleniyor...' : `${filteredProducts.length} ürün listeleniyor`}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
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

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block lg:col-span-1`}>
            <div className="sticky top-24 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
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

          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-[#1E3A5F] mb-4" />
                <p className="text-gray-600">Ürünler yükleniyor, lütfen bekleyin...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 sm:gap-4">
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