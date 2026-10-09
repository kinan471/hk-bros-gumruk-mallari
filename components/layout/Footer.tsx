import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-gray-300 mt-20">
      <div className="h-1 bg-gradient-to-r from-[#1E3A5F] via-[#4A90A4] to-[#E8B04B]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                <Image src="/logo.png" alt="HK BROS" width={48} height={48} className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg leading-tight">HK BROS</h3>
                <p className="text-xs text-gray-400">GÜMRÜK MALLARI</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              En kaliteli gümrük ürünlerini en uygun fiyatlarla kapınıza kadar getiriyoruz. Güvenli alışverişin adresi.
            </p>
            
            <div className="flex gap-3 pt-2">
              <a href="https://wa.me/905551234567" aria-label="WhatsApp" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-5 text-lg">Hızlı Linkler</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-[#E8B04B] transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gray-500 rounded-full"></span>Ana Sayfa</Link></li>
              <li><Link href="/about" className="hover:text-[#E8B04B] transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gray-500 rounded-full"></span>Hakkımızda</Link></li>
              <li><Link href="/contact" className="hover:text-[#E8B04B] transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gray-500 rounded-full"></span>İletişim</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-5 text-lg">İletişim</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#E8B04B] flex-shrink-0 mt-0.5" />
                <span>İstanbul, Türkiye</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#E8B04B] flex-shrink-0" />
                <span className="hover:text-white transition-colors">+90 555 123 45 67</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#E8B04B] flex-shrink-0" />
                <span className="hover:text-white transition-colors">info@hkbros.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© 2026 HK BROS GÜMRÜK MALLARI. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}