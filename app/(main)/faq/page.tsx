import Link from 'next/link';
import { ArrowLeft, HelpCircle, ShieldCheck, Truck, RotateCcw, FileText } from 'lucide-react';

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
      { q: "Kargo ücretli mi?", a: "250 TL ve üzeri tüm siparişlerde kargo tamamen ücretsizdir. 250 TL altı siparişlerde standart kargo ücreti uygulanır." },
      { q: "Siparişim kaç günde elime ulaşır?", a: "Siparişleriniz onaylandıktan sonra 1 iş günü içinde kargoya verilir. Türkiye geneline ortalama 2-4 iş günü içinde teslim edilir." }
    ]
  },
  {
    category: "Garanti ve İade",
    icon: <RotateCcw className="w-6 h-6 text-[#1E3A5F]" />,
    items: [
      { q: "Ürünlerde garanti var mı?", a: "Evet, elektronik ürünlerde distribütör veya satıcı garantisi bulunmaktadır. Ürün sayfasında garanti süresi detaylı olarak belirtilmiştir." },
      { q: "İade koşullarınız nelerdir?", a: "Cayma hakkı kapsamında, teslim aldığınız tarihten itibaren 14 gün içinde, ürünü kullanmadan ve orijinal ambalajına zarar vermeden iade edebilirsiniz." }
    ]
  },
  {
    category: "Güvenlik ve Ödeme",
    icon: <ShieldCheck className="w-6 h-6 text-[#1E3A5F]" />,
    items: [
      { q: "Ödemem güvenli mi?", a: "Evet, tüm ödemeler 256-bit SSL sertifikası ile korunmaktadır. Kredi kartı bilgileriniz sistemimizde saklanmaz, altyapımız 3D Secure ile desteklenmektedir." },
      { q: "Fatura veriliyor mu?", a: "Evet, yasal bir işletme olduğumuz için her siparişinizde e-Fatura tarafınıza iletilir." }
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
          <a href="https://wa.me/905551234567" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-[#1E3A5F] px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors">
            WhatsApp ile İletişime Geçin
          </a>
        </div>
      </div>
    </div>
  );
}