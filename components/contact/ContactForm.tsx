'use client';

import { useState } from 'react';
import { Send, CheckCircle, Loader2, MessageCircle } from 'lucide-react';
import { STORE_CONTACT } from '@/lib/config/store';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.message) {
      setError('Lütfen adınızı ve mesajınızı girin');
      return;
    }

    setIsSubmitting(true);

    try {
      const messageText = `Yeni İletişim Formu Mesajı:%0A%0AAd: ${formData.name}%0AEmail: ${formData.email}%0ATelefon: ${formData.phone}%0AKonu: ${formData.subject}%0AMesaj: ${formData.message}`;
      
      window.open(
        `https://wa.me/${STORE_CONTACT.whatsappNumber}?text=${messageText}`,
        '_blank'
      );

      setIsSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      
      setTimeout(() => setIsSuccess(false), 4000);
    } catch {
      setError('Mesaj gönderilirken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Bize Mesaj Gönderin</h3>
        <p className="text-gray-600">Formu doldurun, en kısa sürede size dönüş yapalım</p>
      </div>

      {isSuccess ? (
        <div className="flex items-center gap-3 p-6 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
          <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-green-900 text-lg">Mesajınız Alındı!</p>
            <p className="text-sm text-green-700 mt-1">WhatsApp üzerinden size dönüş yapacağız.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Adınız Soyadınız *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 outline-none transition-all"
                placeholder="Adınızı girin"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                E-posta Adresi
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 outline-none transition-all"
                placeholder="ornek@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Telefon Numarası
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 outline-none transition-all"
                placeholder="+90 5XX XXX XX XX"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Konu
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 outline-none transition-all bg-white"
              >
                <option value="">Konu Seçin</option>
                <option value="Sipariş">Sipariş Hakkında</option>
                <option value="Ürün">Ürün Bilgisi</option>
                <option value="İade">İade & Değişim</option>
                <option value="Toptan">Toptan Satış</option>
                <option value="Diger">Diğer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mesajınız *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 outline-none transition-all resize-none"
              placeholder="Mesajınızı buraya yazın..."
              required
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {formData.message.length} karakter
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#1E3A5F] to-[#4A90A4] text-white py-4 rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 hover:scale-[1.02]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Mesajı Gönder
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
            <MessageCircle className="w-4 h-4" />
            <span>Mesajınız WhatsApp üzerinden iletilecektir</span>
          </div>
        </form>
      )}
    </div>
  );
}