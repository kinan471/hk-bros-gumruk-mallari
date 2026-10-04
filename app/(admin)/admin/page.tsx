import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { 
  Package, ShoppingCart, DollarSign, AlertTriangle,
  TrendingUp, Eye, Clock, ArrowUpRight,
  Plus, MoreVertical
} from 'lucide-react';

export const metadata = {
  title: 'Kontrol Paneli - HK BROS Admin',
};

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { count: totalCategories } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { count: lowStockProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .eq('track_inventory', true)
    .lte('stock_quantity', 5)
    .gt('stock_quantity', 0);

  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  const { data: recentProducts } = await supabase
    .from('products')
    .select('id, name, slug, regular_price, sale_price, stock_quantity, track_inventory, created_at, categories(name)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: topProducts } = await supabase
    .from('products')
    .select('id, name, slug, regular_price, sale_price, views_count, main_image')
    .eq('is_active', true)
    .order('views_count', { ascending: false })
    .limit(5);

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, order_number, customer_name, total_amount, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  const stats = [
    {
      label: 'Toplam Ürün',
      value: totalProducts || 0,
      icon: Package,
      change: '+12%',
      trend: 'up',
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Kategoriler',
      value: totalCategories || 0,
      icon: Package,
      change: '+3%',
      trend: 'up',
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Toplam Sipariş',
      value: totalOrders || 0,
      icon: ShoppingCart,
      change: '+8%',
      trend: 'up',
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Düşük Stok',
      value: lowStockProducts || 0,
      icon: AlertTriangle,
      change: 'Uyarı',
      trend: 'down',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Kontrol Paneli</h1>
          <p className="text-sm text-gray-500 mt-1">Hoş geldiniz, işte mağazanızın genel özeti</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Products */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#1E3A5F]" />
                Son Eklenen Ürünler
              </h2>
              <Link
                href="/admin/products"
                className="text-sm text-[#1E3A5F] hover:underline font-medium flex items-center gap-1"
              >
                Tümünü Gör <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentProducts && recentProducts.length > 0 ? (
              recentProducts.map((product: any) => (
                <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>{product.categories?.name || 'Kategori yok'}</span>
                        <span>•</span>
                        <span className="font-medium text-[#1E3A5F]">
                          ₺{product.sale_price || product.regular_price || 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {product.track_inventory && product.stock_quantity <= 5 && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                          Düşük Stok
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                Henüz ürün yok. <Link href="/admin/products/new" className="text-[#1E3A5F] hover:underline">İlk ürününüzü ekleyin</Link>
              </div>
            )}
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Stok Uyarıları
            </h2>
          </div>
          <div className="p-6">
            {lowStockProducts && lowStockProducts > 0 ? (
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-orange-900 text-sm">
                        {lowStockProducts} ürün düşük stokta
                      </p>
                      <p className="text-xs text-orange-700 mt-1">
                        Stok miktarı 5 veya daha az
                      </p>
                    </div>
                  </div>
                </div>
                <Link
                  href="/admin/products"
                  className="block w-full text-center bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors text-sm"
                >
                  Ürünleri İncele
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-8 h-8 text-green-600" />
                </div>
                <p className="font-semibold text-gray-900">Stoklar Yeterli</p>
                <p className="text-sm text-gray-500 mt-1">Tüm ürünler yeterli stokta</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Products & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Viewed Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#1E3A5F]" />
              En Çok Görüntülenen
            </h2>
          </div>
          <div className="p-6">
            {topProducts && topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product: any, index) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#1E3A5F] to-[#4A90A4] rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {product.views_count || 0} görüntülenme
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#1E3A5F] text-sm">
                        ₺{product.sale_price || product.regular_price || 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Henüz veri yok
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#1E3A5F]" />
                Son Siparişler
              </h2>
              <Link
                href="/admin/orders"
                className="text-sm text-[#1E3A5F] hover:underline font-medium flex items-center gap-1"
              >
                Tümünü Gör <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentOrders && recentOrders.length > 0 ? (
              recentOrders.map((order: any) => (
                <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#1E3A5F] text-sm">{order.order_number}</span>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status === 'delivered' ? 'Teslim Edildi' : 
                           order.status === 'pending' ? 'Beklemede' : order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₺{order.total_amount}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                Henüz sipariş yok
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-[#1E3A5F] to-[#4A90A4] rounded-2xl p-6 sm:p-8 text-white">
        <h2 className="text-xl font-bold mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/admin/products/new"
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors text-center"
          >
            <Plus className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Yeni Ürün</span>
          </Link>
          <Link
            href="/admin/categories"
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors text-center"
          >
            <Package className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Kategoriler</span>
          </Link>
          <Link
            href="/admin/orders"
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors text-center"
          >
            <ShoppingCart className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Siparişler</span>
          </Link>
          <Link
            href="/admin/settings"
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors text-center"
          >
            <MoreVertical className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Ayarlar</span>
          </Link>
        </div>
      </div>
    </div>
  );
}