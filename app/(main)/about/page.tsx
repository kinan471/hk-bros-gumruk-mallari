import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Award, Users, Package, TrendingUp, 
  Shield, Truck, Headphones, CreditCard,
  CheckCircle, ArrowRight, Star
} from 'lucide-react';

export const metadata = {
  title: 'Hakkımızda - HK BROS GÜMRÜK MALLARI',
  description: 'HK BROS olarak kaliteli ürünleri uygun fiyatlarla sunuyoruz. Güvenilir alışverişin adresi.',
};

export default async function AboutPage() {
  const supabase = await createClient();

  const { data: stats } = await supabase
    .from('products')
    .select('id, category_id', { count: 'exact', head: true })
    .eq('is_active', true);

  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { count: categoryCount } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const features = [
    {
      icon: Shield,
      title: 'Güvenli Alışveriş',
      desc: '256-bit SSL şifreleme ile tüm işlemleriniz güvende. Kişisel bilgileriniz asla üçüncü taraflarla paylaşılmaz.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Truck,
      title: 'Hızlı Teslimat',
      desc: 'Siparişleriniz 2-3 iş günü içinde kapınıza ulaşır. Tüm Türkiye\'ye ücretsiz kargo imkanı.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Headphones,
      title: '7/24 Müşteri Desteği',
      desc: 'WhatsApp ve telefon üzerinden her an yanınızdayız. Sorularınız anında yanıtlanır.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: CreditCard,
      title: 'Güvenli Ödeme',
      desc: 'Tüm kredi kartları ve banka kartları kabul edilir. Taksit imkanları ile kolay alışveriş.',
      color: 'from-orange-500 to-orange-600'
    },
  ];

  const values = [
    {
      icon: Award,
      title: 'Kalite',
      desc: 'Sadece orijinal ve kaliteli ürünler sunuyoruz'
    },
    {
      icon: Users,
      title: 'Müşteri Odaklılık',
      desc: 'Müşteri memnuniyeti bizim önceliğimizdir'
    },
    {
      icon: TrendingUp,
      title: 'İnovasyon',
      desc: 'Sürekli gelişen teknolojiyi takip ediyoruz'
    },
    {
      icon: CheckCircle,
      title: 'Güvenilirlik',
      desc: 'Şeffaf ve dürüst ticaret anlayışı'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#4A90A4] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1 w-12 bg-[#E8B04B] rounded-full" />
              <span className="text-sm font-semibold uppercase tracking-wider text-[#E8B04B]">
                Hakkımızda
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight">
              HK BROS GÜMRÜK MALLARI
            </h1>
            
            <p className="text-xl sm:text-2xl text-white/90 mb-8 leading-relaxed">
              Kaliteli ürünleri uygun fiyatlarla sunan, güvenilir alışverişin adresi. 
              Müşteri memnuniyetini ön planda tutan hizmet anlayışımızla yanınızdayız.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-white text-[#1E3A5F] px-6 py-3 rounded-full font-bold hover:bg-[#E8B04B] hover:text-white transition-all shadow-xl"
              >
                Ürünleri Keşfet
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full font-bold hover:bg-white/20 transition-all border border-white/30"
              >
                İletişime Geç
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { icon: Package, value: productCount || '100+', label: 'Aktif Ürün' },
            { icon: Users, value: '5000+', label: 'Mutlu Müşteri' },
            { icon: Award, value: categoryCount || '10+', label: 'Kategori' },
            { icon: TrendingUp, value: '99%', label: 'Memnuniyet' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center hover:-translate-y-1 transition-transform"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#1E3A5F] to-[#4A90A4] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-[#1E3A5F] mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-8 bg-[#E8B04B] rounded-full" />
              <span className="text-sm font-semibold uppercase tracking-wider text-[#1E3A5F]">
                Hikayemiz
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Kalite ve Güvenin Buluştuğu Nokta
            </h2>
            
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <strong className="text-[#1E3A5F]">HK BROS GÜMRÜK MALLARI</strong> olarak, 
                müşterilerimize en kaliteli ürünleri en uygun fiyatlarla sunmayı hedefliyoruz. 
                Yılların verdiği tecrübe ve müşteri odaklı yaklaşımımızla, güvenilir bir 
                alışveriş deneyimi sunuyoruz.
              </p>
              <p>
                Gümrük malları sektöründe öncü olmayı hedefleyen firmamız, orijinal ürünleri 
                uygun fiyatlarla buluşturarak müşteri memnuniyetini en üst seviyede tutmayı 
                amaçlamaktadır.
              </p>
              <p>
                Her ürünümüz özenle seçilir, kalite kontrollerinden geçirilir ve müşterilerimize 
                en iyi şekilde ulaşması için paketlenir. Amacımız sadece ürün satmak değil, 
                uzun vadeli bir güven ilişkisi kurmaktır.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#E8B04B]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-[#E8B04B]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{value.title}</h4>
                      <p className="text-xs text-gray-600 mt-0.5">{value.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] bg-gradient-to-br from-[#1E3A5F] to-[#4A90A4] rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center text-white text-center p-8">
                <div>
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star className="w-12 h-12 text-[#E8B04B] fill-current" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2">HK BROS</h3>
                  <p className="text-white/80">GÜMRÜK MALLARI</p>
                  <div className="mt-6 flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className="w-5 h-5 text-[#E8B04B] fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-white/70 mt-2">5.0 Müşteri Puanı</p>
                </div>
              </div>
            </div>
            
            {/* Decorative */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#E8B04B] rounded-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#1E3A5F]/10 rounded-2xl -z-10" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-1 w-8 bg-[#E8B04B] rounded-full" />
              <span className="text-sm font-semibold uppercase tracking-wider text-[#1E3A5F]">
                Neden Biz?
              </span>
              <div className="h-1 w-8 bg-[#E8B04B] rounded-full" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Size Sunduğumuz Ayrıcalıklar
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Müşterilerimize en iyi alışveriş deneyimini sunmak için çalışıyoruz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-gray-50 rounded-2xl p-6 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] rounded-2xl p-8 sm:p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-[#E8B04B]" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Misyonumuz</h3>
              <p className="text-white/90 leading-relaxed">
                Müşterilerimize kaliteli, orijinal ve uygun fiyatlı ürünler sunarak 
                güvenilir bir alışveriş deneyimi sağlamak. Her müşterimizin beklentilerini 
                aşan hizmet sunmak ve sektörde öncü olmak.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#E8B04B] to-[#F5C06B] rounded-2xl p-8 sm:p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Vizyonumuz</h3>
              <p className="text-white/90 leading-relaxed">
                Türkiye'nin en güvenilir ve tercih edilen gümrük malları platformu olmak. 
                Teknolojiyi kullanarak müşteri deneyimini sürekli geliştirmek ve global 
                ölçekte rekabet edebilir bir marka haline gelmek.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full" />
            <div className="absolute bottom-10 right-10 w-48 h-48 border-2 border-white rounded-full" />
          </div>
          
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Bizimle İletişime Geçin
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Sorularınız, önerileriniz veya iş birlikleri için bize ulaşın. 
              Size en kısa sürede dönüş yapacağız.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-[#E8B04B] text-gray-900 px-6 py-3 rounded-full font-bold hover:bg-[#F5C06B] transition-all"
              >
                İletişim Formu
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="https://wa.me/905551234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full font-bold hover:bg-green-600 transition-all"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}