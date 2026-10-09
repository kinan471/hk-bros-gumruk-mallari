import Link from 'next/link';
import { ArrowLeft, HelpCircle, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { STORE_CONTACT, STORE_RETURN_WINDOW_DAYS, STORE_SHIPPING } from '@/lib/config/store';

const faqs = [
  {
    category: "Genel Bilgiler",
    icon: <HelpCircle className="w-6 h-6 text-[#1E3A5F]" />,
    items: [
      { q: "Gümrük malları nedir?", a: "Gümrük işlemleri yasal olarak tamamlanmış, vergileri ödenmiş ve Türkiye'de satışa sunulmasına izin verilen orijinal ürünlerdir. Bu ürünler genellikle iade, teşhir veya ambalajı hafif hasarlı olduğu için piyasa fiyatının çok altında satılır." },
      { q: "Ürünler orijinal mi?", a: "Evet, sattığımız tüm ürünler %100 orijinaldir. Sahte veya taklit ürün kesinlikle satmamaktayız." }
    ]
  },
  {
    category: "Sipariş ve Kargo",
    icon: <Truck className="w-6 h-6 text-[#1E3A5F]" />,
    items: [
      { q: "Kargo ücretli mi?", a: `${STORE_SHIPPING.freeShippingMinimum.toLocaleString('tr-TR')} TL ve üzeri siparişlerde kargo ücretsizdir. Bu tutarın altındaki siparişlerde ${STORE_SHIPPING.standardShippingFee} TL standart kargo ücreti uygulanır.` },
      { q: "Siparişim kaç günde elime ulaşır?", a: `Siparişiniz onaylandıktan sonra ${STORE_SHIPPING.dispatchTime} içinde kargoya verilir. Türkiye geneli tahmini teslimat süresi ${STORE_SHIPPING.estimatedDelivery}.` }
    ]
  },
  {
    category: "Garanti ve İade",
    icon: <RotateCcw className="w-6 h-6 text-[#1E3A5F]" />,
    items: [
      { q: "Ürünlerde garanti var mı?", a: "Garanti bilgisi ürün sayfasında belirtilir. Ürüne özel garanti süresi görünmüyorsa sipariş vermeden önce WhatsApp üzerinden bilgi alabilirsiniz." },
      { q: "İade koşullarınız nelerdir?", a: `Ürünü teslim aldığınız tarihten itibaren ${STORE_RETURN_WINDOW_DAYS} gün içinde iade talebi oluşturmak için bizimle iletişime geçebilirsiniz.` }
    ]
  },
  {
    category: "Güvenlik ve Ödeme",
    icon: <ShieldCheck className="w-6 h-6 text-[#1E3A5F]" />,
    items: [
      { q: "Ödeme nasıl yapılır?", a: "Siparişinizi web sitesi üzerinden oluşturabilirsiniz. Ödeme yöntemi ve sipariş onayı WhatsApp üzerinden sizinle ayrıca paylaşılır; bu sitede kredi kartı ödeme işlemi yapılmamaktadır." },
      { q: "Fatura hakkında nasıl bilgi alabilirim?", a: "Siparişinize ait fatura bilgileri için WhatsApp üzerinden bizimle iletişime geçebilirsiniz." }
    ]
  }
];

export const metadata = { title: 'Sıkça Sorulan Sorular - HK BROS' };

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[#1E3A5F] hover:text-[#1A3354] font-medium mb-8">
          <ArrowLeft className="w-5 h-5" /> Ana Sayfaya Dön
        </Link>
        
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Sıkça Sorulan Sorular</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Aklınızdaki soruların cevaplarını burada bulabilirsiniz. Aradığınızı bulamazsanız WhatsApp üzerinden bize ulaşabilirsiniz.</p>
        </div>

        <div className="space-y-8">
          {faqs.map((section, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">{section.icon}</div>
                <h2 className="text-xl font-bold text-gray-900">{section.category}</h2>
              </div>
              <div className="space-y-6">
                {section.items.map((item, i) => (
                  <div key={i} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-start gap-2">
                      <span className="text-[#E8B04B] mt-1">•</span> {item.q}
                    </h3>
                    <p className="text-gray-600 leading-relaxed pl-5">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-[#1E3A5F] to-[#4A90A4] rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">Daha fazla yardıma mı ihtiyacınız var?</h3>
          <p className="text-white/90 mb-6">Müşteri hizmetlerimiz size yardımcı olmaktan mutluluk duyacaktır.</p>
          <a href={`https://wa.me/${STORE_CONTACT.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-[#1E3A5F] px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors">
            WhatsApp ile İletişime Geçin
          </a>
        </div>
      </div>
    </div>
  );
}