'use client';
import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { fetchReviewSummaries } from '@/lib/utils/reviewSummaries';
import ProductCard from '@/components/products/ProductCard';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2, Loader2, Package } from 'lucide-react';
import type { ProductCardProduct } from '@/types/database';
import type { ReviewSummary } from '@/lib/utils/reviewSummaries';
import { getFavoriteIds, saveFavoriteIds } from '@/lib/utils/wishlist';

type FavoriteProduct = ProductCardProduct & {
  short_description: string | null;
  is_active: boolean;
  created_at: string;
  category_id: string | null;
  categories: { name: string; slug: string }[] | null;
  reviewSummary: ReviewSummary;
};

export default function FavoritesPage() {
  const supabase = useMemo(() => createClient(), []);
  const [products, setProducts] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadFavorites = async () => {
      try {
        const ids = getFavoriteIds();

        if (!isMounted) return;
        setFavoriteIds(ids);

        if (ids.length === 0) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('products')
          .select('id, name, slug, main_image, regular_price, sale_price, is_featured, track_inventory, stock_quantity, stock_status, product_condition, brand, product_type, short_description, is_active, created_at, category_id, categories(name, slug)')
          .in('id', ids)
          .eq('is_active', true);

        if (!isMounted) return;

        if (error) {
          console.error('Supabase error:', error.message, error.details);
          throw error;
        }

        const productIds = (data ?? []).map((p) => p.id);
        const reviewSummaries = productIds.length > 0 
          ? await fetchReviewSummaries(supabase, productIds)
          : {};

        const sortedProducts = (data ?? [])
          .map((product) => ({
            ...product,
            reviewSummary: reviewSummaries[product.id] ?? { averageRating: 0, reviewCount: 0 },
          }))
          .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

        if (isMounted) {
          setProducts(sortedProducts);
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error loading favorites:', error);
          setLoading(false);
        }
      }
    };

    loadFavorites();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const removeFromFavorites = (productId: string) => {
    if (typeof window !== 'undefined') {
      const updated = favoriteIds.filter((id) => id !== productId);
      saveFavoriteIds(updated);
      setFavoriteIds(updated);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  const clearAllFavorites = () => {
    if (confirm('Tüm favorileri silmek istediğinize emin misiniz?')) {
      saveFavoriteIds([]);
      setFavoriteIds([]);
      setProducts([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#1E3A5F]" />
          <p className="text-gray-600">Favoriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#1E3A5F]/10 to-[#4A90A4]/10 flex items-center justify-center">
              <Heart className="w-12 h-12 text-[#1E3A5F]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Favori Listeniz Boş
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Henüz favori ürün eklemediniz. Beğendiğiniz ürünleri favorilere ekleyerek daha sonra kolayca bulabilirsiniz.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#1E3A5F] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#1A3354] transition-colors shadow-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Ürünlere Göz At</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-[#1E3A5F] transition-colors">
              Ana Sayfa
            </Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 font-medium">Favorilerim</span>
          </nav>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-7 h-7 text-white fill-current" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Favorilerim</h1>
                <p className="text-gray-600 mt-1">
                  {products.length} ürün favorilerinizde
                </p>
              </div>
            </div>

            {products.length > 1 && (
              <button
                onClick={clearAllFavorites}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Tümünü Sil</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard
                product={product}
                reviewSummary={product.reviewSummary}
              />
              
              <button
                onClick={() => removeFromFavorites(product.id)}
                className="absolute top-3 right-3 z-20 p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 text-red-500 hover:text-red-600 hover:bg-red-50"
                aria-label="Favorilerden çıkar"
                title="Favorilerden çıkar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full border border-gray-200 shadow-sm">
            <Package className="w-4 h-4 text-[#1E3A5F]" />
            <span className="text-sm text-gray-600">
              Favori ürünleriniz tarayıcınızda saklanır
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}