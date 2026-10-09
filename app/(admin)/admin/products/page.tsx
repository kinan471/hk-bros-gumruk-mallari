'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { revalidatePublicCatalog } from '@/lib/utils/revalidatePublicCatalog';
import { Product, Category } from '@/types/database';
import {
  Plus, Search, Grid3x3, List, Edit, Trash2,
  Eye, EyeOff, Package, AlertTriangle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

type ViewMode = 'grid' | 'list';
type StatusFilter = 'all' | 'published' | 'draft';
type StockFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'name'>('newest');

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data as Category[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      return revalidatePublicCatalog();
    },
    onSuccess: (cacheUpdated) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      if (!cacheUpdated) alert('Ürün silindi; ancak mağaza önbelleği yenilenemedi. Değişiklikler kısa süre içinde görünür.');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !isActive, status: !isActive ? 'published' : 'draft' })
        .eq('id', id);
      if (error) throw error;
      return revalidatePublicCatalog();
    },
    onSuccess: (cacheUpdated) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      if (!cacheUpdated) alert('Durum güncellendi; ancak mağaza önbelleği yenilenemedi. Değişiklikler kısa süre içinde görünür.');
    },
  });

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let result = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    if (stockFilter !== 'all') {
      result = result.filter(p => {
        if (stockFilter === 'in_stock') return p.stock_status === 'in_stock' && p.stock_quantity > 5;
        if (stockFilter === 'low_stock') return p.stock_quantity > 0 && p.stock_quantity <= 5;
        if (stockFilter === 'out_of_stock') return p.stock_status === 'out_of_stock' || p.stock_quantity === 0;
        return true;
      });
    }

    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category_id === categoryFilter);
    }

    switch (sortBy) {
      case 'price_low':
        result.sort((a, b) => (a.sale_price || a.regular_price || 0) - (b.sale_price || b.regular_price || 0));
        break;
      case 'price_high':
        result.sort((a, b) => (b.sale_price || b.regular_price || 0) - (a.sale_price || a.regular_price || 0));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [products, searchQuery, statusFilter, stockFilter, categoryFilter, sortBy]);

  const stats = useMemo(() => {
    if (!products) return { total: 0, published: 0, draft: 0, lowStock: 0 };
    return {
      total: products.length,
      published: products.filter(p => p.status === 'published').length,
      draft: products.filter(p => p.status === 'draft').length,
      lowStock: products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length,
    };
  }, [products]);

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ürünler</h1>
          <p className="text-sm text-gray-500 mt-1">
            Toplam {stats.total} ürün • {stats.published} yayında • {stats.draft} taslak
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-[#1E3A5F] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#1A3354] transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" />
          Yeni Ürün Ekle
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Toplam</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Yayında</p>
              <p className="text-xl font-bold text-gray-900">{stats.published}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <EyeOff className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Taslak</p>
              <p className="text-xl font-bold text-gray-900">{stats.draft}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Düşük Stok</p>
              <p className="text-xl font-bold text-gray-900">{stats.lowStock}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Ürün ara (isim, SKU, marka)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#1E3A5F] outline-none bg-white"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="published">Yayında</option>
              <option value="draft">Taslak</option>
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as StockFilter)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#1E3A5F] outline-none bg-white"
            >
              <option value="all">Tüm Stoklar</option>
              <option value="in_stock">Stokta Var</option>
              <option value="low_stock">Düşük Stok</option>
              <option value="out_of_stock">Tükendi</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#1E3A5F] outline-none bg-white"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories?.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#1E3A5F] outline-none bg-white"
            >
              <option value="newest">En Yeni</option>
              <option value="price_low">Fiyat: Düşük</option>
              <option value="price_high">Fiyat: Yüksek</option>
              <option value="name">İsim (A-Z)</option>
            </select>

            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 ${viewMode === 'grid' ? 'bg-[#1E3A5F] text-white' : 'bg-white text-gray-600'}`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 ${viewMode === 'list' ? 'bg-[#1E3A5F] text-white' : 'bg-white text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-[#1E3A5F]" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ürün Bulunamadı</h3>
          <p className="text-gray-500 mb-4">Arama kriterlerinize uygun ürün bulunamadı</p>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-[#1E3A5F] text-white px-4 py-2 rounded-lg hover:bg-[#1A3354]"
          >
            <Plus className="w-4 h-4" />
            Yeni Ürün Ekle
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="relative aspect-square bg-gray-100">
                <Image
                  src={product.main_image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.status === 'published' && (
                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">Yayında</span>
                  )}
                  {product.status === 'draft' && (
                    <span className="px-2 py-1 bg-gray-500 text-white text-xs font-semibold rounded-full">Taslak</span>
                  )}
                  {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                    <span className="px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">Düşük Stok</span>
                  )}
                  {product.stock_quantity === 0 && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">Tükendi</span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">{product.name}</h3>
                
                {product.product_condition && (
                  <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-full mb-2">
                    {product.product_condition}
                  </span>
                )}

                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-[#1E3A5F]">
                    ₺{product.sale_price || product.regular_price || 0}
                  </span>
                  <span className="text-xs text-gray-500">
                    Stok: {product.stock_quantity}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    Düzenle
                  </Link>
                  <button
                    onClick={() => toggleStatusMutation.mutate({ id: product.id, isActive: product.is_active })}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title={product.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                  >
                    {product.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
                        deleteMutation.mutate(product.id);
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase">Ürün</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase">Kategori</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase">Fiyat</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase">Stok</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase">Durum</th>
                  <th className="p-4 text-right text-xs font-semibold text-gray-600 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={product.main_image}
                          alt={product.name}
                          width={48}
                          height={48}
                          sizes="48px"
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.sku || 'SKU yok'}</p>
                          {product.product_condition && (
                            <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-full mt-1">
                              {product.product_condition}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{product.categories?.name || '-'}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-[#1E3A5F]">₺{product.sale_price || product.regular_price || 0}</p>
                        {product.sale_price && (
                          <p className="text-xs text-gray-400 line-through">₺{product.regular_price}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        product.stock_quantity === 0 ? 'bg-red-100 text-red-700' :
                        product.stock_quantity <= 5 ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {product.stock_quantity} adet
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        product.status === 'published' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {product.status === 'published' ? 'Yayında' : 'Taslak'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => toggleStatusMutation.mutate({ id: product.id, isActive: product.is_active })}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {product.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
                              deleteMutation.mutate(product.id);
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}