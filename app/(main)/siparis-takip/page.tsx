'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Package, Search, Truck, CheckCircle, Clock, XCircle, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

type TrackedOrderItem = {
  name: string;
  quantity: number;
  price: number;
  condition?: string | null;
};

type TrackedOrder = {
  order_number: string;
  status: string;
  tracking_number: string | null;
  tracking_url: string | null;
  courier_name: string | null;
  items: TrackedOrderItem[];
  total_amount: number;
  notes: string | null;
};

export default function OrderTrackingPage() {
  const supabase = createClient();
  const [orderNumber, setOrderNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('order_number, status, tracking_number, tracking_url, courier_name, items, total_amount, notes')
        .eq('order_number', orderNumber.trim().toUpperCase())
        .eq('customer_phone', phoneNumber.trim())
        .single();

      if (fetchError || !data) {
        setError('Sipariş bulunamadı. Lütfen sipariş numarası ve telefon numaranızı kontrol edin.');
      } else {
        setOrder(data as TrackedOrder);
      }
    } catch (err) {
      console.error('Order tracking request failed:', err);
      setError('Bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'confirmed': return <CheckCircle className="w-6 h-6 text-blue-500" />;
      case 'processing': return <Package className="w-6 h-6 text-purple-500" />;
      case 'shipped': return <Truck className="w-6 h-6 text-indigo-500" />;
      case 'delivered': return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'cancelled': return <XCircle className="w-6 h-6 text-red-500" />;
      default: return <Clock className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Beklemede (Onay Bekliyor)';
      case 'confirmed': return 'Sipariş Onaylandı';
      case 'processing': return 'Hazırlanıyor';
      case 'shipped': return 'Kargoya Verildi';
      case 'delivered': return 'Teslim Edildi';
      case 'cancelled': return 'İptal Edildi';
      default: return 'Bilinmiyor';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sipariş Takibi</h1>
          <p className="text-gray-600">Siparişinizin güncel durumunu öğrenmek için bilgilerinizi girin.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sipariş Numarası (Örn: ORD-12345)</label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 outline-none uppercase"
                placeholder="ORD-..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kayıtlı Telefon Numarası</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 outline-none"
                placeholder="+90 5XX XXX XX XX"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#1E3A5F] text-white py-3.5 rounded-xl font-bold hover:bg-[#1A3354] transition-colors disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Sorgula
            </button>
          </form>
          {error && <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg text-center">{error}</p>}
        </div>

        {order && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm text-gray-500">Sipariş Numarası</p>
                  <p className="text-xl font-bold text-[#1E3A5F] font-mono">{order.order_number}</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                  {getStatusIcon(order.status)}
                  <span className="font-semibold text-gray-900">{getStatusText(order.status)}</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {order.status === 'shipped' && (order.tracking_number || order.tracking_url) && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                  <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Kargo Bilgileri
                  </h3>
                  <div className="space-y-1 text-sm text-indigo-800">
                    {order.courier_name && <p><span className="font-medium">Kargo Firması:</span> {order.courier_name}</p>}
                    {order.tracking_number && <p><span className="font-medium">Takip Numarası:</span> {order.tracking_number}</p>}
                    {order.tracking_url && (
                      <a 
                        href={order.tracking_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-indigo-700 font-semibold hover:underline"
                      >
                        Kargomu Takip Et <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Sipariş Özeti</h3>
                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.quantity}x {item.name}</span>
                      <span className="font-medium">₺{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Toplam Tutar</span>
                  <span className="text-xl font-bold text-[#1E3A5F]">₺{order.total_amount.toFixed(2)}</span>
                </div>
              </div>

              {order.notes && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">Satıcı Notu:</span> {order.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/" className="text-[#1E3A5F] hover:underline font-medium">
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}