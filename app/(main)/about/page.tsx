import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Truck, RotateCcw, MessageCircle, Clock, MapPin } from 'lucide-react';
import { STORE_BUSINESS_HOURS, STORE_CONTACT, STORE_RETURN_WINDOW_DAYS, STORE_SHIPPING } from '@/lib/config/store';

export const metadata = { title: 'Hakkımızda - HK BROS GÜMRÜK MALLARI' };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[#1E3A5F] hover:text-[#1A3354] font-medium mb-8">
          <ArrowLeft className="w-5 h-5" /> Ana Sayfaya Dön
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#1E3A5F] to-[#4A90A4] p-8 sm:p-12 text-white text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">HK BROS Hakkında</h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Gümrük işlemleri tamamlanmış, orijinal ve kaliteli ürünleri en uygun fiyatlarla sizlere ulaştırmak için buradayız.
            </p>
          </div>

          <div className="p-8 sm:p-12 space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Hikayemiz ve Misyonumuz</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                HK BROS olarak, gümrük işlemleri yasal olarak tamamlanmış ürünleri, aracıları ortadan kaldırarak doğrudan son kullanıcıya en avantajlı fiyatlarla sunmayı hedefliyoruz. 
              </p>
              <p className="text-gray-600 leading-relaxed">
                Henüz yeni bir girişim olmamıza rağmen, <strong className="text-[#1E3A5F]">şeffaflık, dürüstlük ve müşteri memnuniyeti</strong> ilkelerinden asla ödün vermiyoruz. Her siparişi, kendi ailemize alıyormuş gibi özenle hazırlıyor ve paketliyoruz. Bizim için önemli olan sadece satış yapmak değil, uzun vadeli bir güven ilişkisi kurmaktır.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Neden HK BROS?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <ShieldCheck className="w-10 h-10 text-[#1E3A5F] mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">Açık Ürün Bilgileri</h3>
                  <p className="text-sm text-gray-600">Ürün durumu ve özellikleri, ürün sayfalarında paylaşılan açıklama ve görsellerde belirtilir.</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <Truck className="w-10 h-10 text-[#1E3A5F] mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">Hızlı ve Güvenli Kargo</h3>
                  <p className="text-sm text-gray-600">Siparişiniz onaylandıktan sonra {STORE_SHIPPING.dispatchTime} içinde kargoya verilir. Tahmini teslimat süresi {STORE_SHIPPING.estimatedDelivery}.</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <RotateCcw className="w-10 h-10 text-[#1E3A5F] mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">{STORE_RETURN_WINDOW_DAYS} Gün İçinde İade</h3>
                  <p className="text-sm text-gray-600">Teslim aldığınız tarihten itibaren {STORE_RETURN_WINDOW_DAYS} gün içinde iade talebi oluşturmak için bizimle iletişime geçebilirsiniz.</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1E3A5F] text-white rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">İletişim ve Çalışma Saatlerimiz</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-6 h-6 text-[#E8B04B] flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">WhatsApp Destek</p>
                      <p className="text-white/80 text-sm">Dilediğiniz zaman mesaj bırakabilirsiniz; çalışma saatleri içinde dönüş yapıyoruz.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-6 h-6 text-[#E8B04B] flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Müşteri Hizmetleri</p>
                      {STORE_BUSINESS_HOURS.map((item) => (
                        <p key={item.day} className="text-white/80 text-sm">{item.day}: {item.hours}</p>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-6 h-6 text-[#E8B04B] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Merkez Ofis</p>
                    <p className="text-white/80 text-sm">{STORE_CONTACT.location}</p>
                    <p className="text-white/80 text-sm mt-2">E-posta: {STORE_CONTACT.email}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}