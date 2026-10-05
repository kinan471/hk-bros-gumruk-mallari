import ContactForm from '@/components/contact/ContactForm';
import Link from 'next/link';
import { 
  Phone, Mail, MapPin, MessageCircle, Clock, 
  Send
} from 'lucide-react';

export const metadata = {
  title: 'İletişim - HK BROS GÜMRÜK MALLARI',
  description: 'Bizimle iletişime geçin. WhatsApp, telefon veya e-posta ile ulaşabilirsiniz.',
};

export default function ContactPage() {
  const contactInfo = [
    {
      icon: Phone,
      title: 'Telefon',
      value: '+90 555 123 45 67',
      link: 'tel:+905551234567',
      color: 'from-blue-500 to-blue-600',
      desc: 'Pazartesi - Cumartesi, 09:00 - 20:00'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      value: 'Hızlı Mesaj',
      link: 'https://wa.me/905551234567',
      color: 'from-green-500 to-green-600',
      desc: '7/24 WhatsApp desteği',
      external: true
    },
    {
      icon: Mail,
      title: 'E-posta',
      value: 'info@hkbros.com',
      link: 'mailto:info@hkbros.com',
      color: 'from-purple-500 to-purple-600',
      desc: '24 saat içinde dönüş'
    },
    {
      icon: MapPin,
      title: 'Adres',
      value: 'İstanbul, Türkiye',
      link: '#map',
      color: 'from-orange-500 to-orange-600',
      desc: 'Merkez ofisimiz'
    },
  ];

  const businessHours = [
    { day: 'Pazartesi - Cuma', hours: '09:00 - 20:00' },
    { day: 'Cumartesi', hours: '10:00 - 18:00' },
    { day: 'Pazar', hours: 'Kapalı' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#4A90A4] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-12 bg-[#E8B04B] rounded-full" />
              <span className="text-sm font-semibold uppercase tracking-wider text-[#E8B04B]">
                İletişim
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
              Bizimle İletişime Geçin
            </h1>
            
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
              Sorularınız, önerileriniz veya siparişleriniz için bize ulaşın. 
              Size en kısa sürede yardımcı olmaktan mutluluk duyarız.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            const Component = info.external ? 'a' : Link;
            return (
              <Component
                key={index}
                href={info.link}
                {...(info.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:-translate-y-1 transition-all group"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{info.title}</h3>
                <p className="text-[#1E3A5F] font-semibold text-sm mb-1">{info.value}</p>
                <p className="text-xs text-gray-500">{info.desc}</p>
              </Component>
            );
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ContactForm />
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-[#1E3A5F]" />
                <h3 className="font-bold text-gray-900">Çalışma Saatleri</h3>
              </div>
              <div className="space-y-3">
                {businessHours.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-700">{item.day}</span>
                    <span className={`text-sm font-semibold ${
                      item.hours === 'Kapalı' ? 'text-red-500' : 'text-[#1E3A5F]'
                    }`}>
                      {item.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-6 h-6" />
                <h3 className="font-bold text-lg">WhatsApp Hattı</h3>
              </div>
              <p className="text-white/90 text-sm mb-4">
                Anlık destek için WhatsApp&apos;tan bize yazın. Genellikle 5 dakika içinde dönüş yapıyoruz.
              </p>
              <a
                href="https://wa.me/905551234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-green-600 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-100 transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Hemen Yaz
              </a>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Sosyal Medya</h3>
              <div className="space-y-2">
                <a
                  href="#"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Facebook</p>
                    <p className="text-xs text-gray-500">@hkbros</p>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-pink-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Instagram</p>
                    <p className="text-xs text-gray-500">@hkbros</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="map" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#1E3A5F]" />
              <h3 className="font-bold text-gray-900 text-lg">Konumumuz</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">İstanbul, Türkiye</p>
          </div>
          <div className="aspect-[16/9] bg-gray-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d192697.79738902396!2d28.8493264!3d41.0151374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14caa7040068086b%3A0xe1ccfe98bc01b0d0!2s%C4%B0stanbul!5e0!3m2!1str!2str!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="HK BROS Konum"
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-br from-[#1E3A5F] to-[#4A90A4] rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full" />
            <div className="absolute bottom-10 right-10 w-48 h-48 border-2 border-white rounded-full" />
          </div>
          
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Merak ettiğiniz konularda hızlı cevaplar alın
            </p>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 bg-white text-[#1E3A5F] px-6 py-3 rounded-full font-bold hover:bg-[#E8B04B] hover:text-white transition-all"
            >
              SSS Sayfasına Git
              <Send className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}