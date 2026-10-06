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
                <Image src="/logo.png" alt="HK BROS" width={48} height={48} className="w-full h-full object-contain p-1" />
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
              <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#E4405F] hover:text-white transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://wa.me/905314319921" aria-label="WhatsApp" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all">
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
                <a href="tel:+905314319921" className="hover:text-white transition-colors">+90 531 431 99 21</a>
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
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Gizlilik Politikası</Link>
            <Link href="#" className="hover:text-white transition-colors">Kullanım Koşulları</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}