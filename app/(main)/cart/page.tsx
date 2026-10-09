'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart/CartContext';
import { calculateShippingCost, STORE_CONTACT, STORE_SHIPPING } from '@/lib/config/store';
import {
  ShoppingCart, Trash2, Plus, Minus,
  ArrowLeft, MessageCircle, ShoppingBag,
  Tag, Loader2, CheckCircle2
} from 'lucide-react';
import { useState } from 'react';

interface CheckoutResult {
  orderNumber: string;
  items: Array<{
    product_id: string;
    name: string;
    quantity: number;
    price: number;
    condition: string | null;
  }>;
  subtotal: number;
  shippingCost: number;
  total: number;
}

function isCheckoutResult(value: unknown): value is CheckoutResult {
  if (!value || typeof value !== 'object') return false;
  const result = value as Record<string, unknown>;
  return (
    typeof result.orderNumber === 'string' &&
    Array.isArray(result.items) &&
    result.items.every((item: unknown) => {
      if (!item || typeof item !== 'object') return false;
      const orderItem = item as Record<string, unknown>;
      return (
        typeof orderItem.product_id === 'string' &&
        typeof orderItem.name === 'string' &&
        Number.isInteger(orderItem.quantity) &&
        typeof orderItem.price === 'number' &&
        Number.isFinite(orderItem.price) &&
        (orderItem.condition === null || typeof orderItem.condition === 'string')
      );
    }) &&
    typeof result.subtotal === 'number' &&
    Number.isFinite(result.subtotal) &&
    typeof result.shippingCost === 'number' &&
    Number.isFinite(result.shippingCost) &&
    typeof result.total === 'number' &&
    Number.isFinite(result.total)
  );
}

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalPrice,
    totalSavings,
    totalItems,
  } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [confirmedTotal, setConfirmedTotal] = useState<number | null>(null);

  const shippingCost = calculateShippingCost(totalPrice);
  const finalTotal = totalPrice + shippingCost;

  const handleCheckout = async () => {
    if (!customerName.trim()) {
      alert('Lütfen adınızı girin');
      return;
    }
    if (!customerPhone.trim()) {
      alert('Lütfen telefon numaranızı girin');
      return;
    }
    if (!customerAddress.trim()) {
      alert('Lütfen teslimat adresinizi girin');
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerAddress,
          customerNotes,
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        }),
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        const errorMessage =
          result && typeof result === 'object' && 'error' in result &&
          typeof result.error === 'string'
            ? result.error
            : 'Unable to save the order. Please try again.';
        throw new Error(errorMessage);
      }
      if (!isCheckoutResult(result)) {
        throw new Error('The server returned an invalid order confirmation.');
      }

      let message = ` *YENİ SİPARİŞ - HK BROS*\n\n`;
      message += `📋 *Sipariş No:* ${result.orderNumber}\n\n`;
      message += `👤 *Müşteri Bilgileri*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━\n`;
      message += `Ad: ${customerName}\n`;
      message += `Telefon: ${customerPhone}\n`;
      message += `Adres: ${customerAddress}\n`;
      if (customerNotes.trim()) message += `Not: ${customerNotes}\n`;
      message += `\n`;

      message += `📦 *Sipariş Detayları*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━\n`;

      result.items.forEach((item, index) => {
        message += `\n*${index + 1}. ${item.name}*\n`;
        message += `   Adet: ${item.quantity}\n`;
        message += `   Birim Fiyat: ₺${item.price}\n`;
        message += `   Toplam: ${(item.price * item.quantity).toFixed(2)}\n`;
        if (item.condition) message += `   Durum: ${item.condition}\n`;
      });

      message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
      message += `💰 *Fiyat Özeti*\n`;
      message += `Ara Toplam: ₺${result.subtotal.toFixed(2)}\n`;
      message += `Kargo: ${result.shippingCost === 0 ? 'Ücretsiz ' : `₺${result.shippingCost}`}\n`;
      message += `\n*GENEL TOPLAM: ₺${result.total.toFixed(2)}*\n`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${STORE_CONTACT.whatsappNumber}?text=${encodedMessage}`;

      setWhatsappUrl(whatsappUrl);
      setConfirmedTotal(result.total);
      setOrderSuccess(true);
      clearCart();
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error instanceof Error ? error.message : 'Sipariş oluşturulurken hata oluştu.');
      setIsSending(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Siparişiniz Alındı!</h1>
          <p className="text-gray-600 mb-6">
            Siparişiniz kaydedildi. Toplam tutar: ₺{confirmedTotal?.toFixed(2)}. Sipariş bilgilerinizi WhatsApp üzerinden gönderebilirsiniz.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp&apos;a Gönder
            </a>
            <Link href="/" className="text-sm text-gray-600 hover:text-[#1E3A5F]">
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sepetiniz Boş</h1>
          <p className="text-gray-600 mb-6">
            Henüz sepetinize ürün eklemediniz.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#1E3A5F] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1A3354] transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Ürünlere Göz At</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-[#1E3A5F] transition-colors">Ana Sayfa</Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 font-medium">Sepet</span>
          </nav>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Alışveriş Sepeti</h1>
              <p className="text-gray-600 mt-1">{totalItems} ürün</p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-[#1E3A5F] hover:text-[#1A3354] font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Alışverişe Devam Et</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex gap-4"
              >
                <Link
                  href={`/products/${item.slug}`}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-semibold text-gray-900 hover:text-[#1E3A5F] transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      {item.condition && (
                        <p className="text-xs text-gray-500 mt-1">{item.condition}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Kaldır"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                    <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-semibold text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-[#1E3A5F] text-lg">
                        ₺{(item.price * item.quantity).toFixed(2)}
                      </p>
                      {item.regularPrice && item.regularPrice > item.price && (
                        <p className="text-xs text-gray-400 line-through">
                          ₺{(item.regularPrice * item.quantity).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                if (confirm('Sepeti temizlemek istediğinize emin misiniz?')) {
                  clearCart();
                }
              }}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              Sepeti Temizle
            </button>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24 space-y-5">
              <h2 className="text-lg font-bold text-gray-900">Sipariş Özeti</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Ara Toplam</span>
                  <span>₺{totalPrice.toFixed(2)}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Tasarruf
                    </span>
                    <span>-₺{totalSavings.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Kargo</span>
                  <span className={shippingCost === 0 ? 'text-emerald-600 font-medium' : ''}>
                    {shippingCost === 0 ? 'Ücretsiz' : `₺${shippingCost}`}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded-lg">
                    ₺{(STORE_SHIPPING.freeShippingMinimum - totalPrice).toFixed(2)} daha ekleyin, kargo ücretsiz olsun!
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-gray-900">Toplam</span>
                  <span className="text-2xl font-bold text-[#1E3A5F]">
                    ₺{finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-4">
                <h3 className="font-semibold text-gray-900 text-sm">Teslimat Bilgileri *</h3>
                <input
                  type="text"
                  placeholder="Ad Soyad *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#1E3A5F] outline-none"
                  required
                />
                <input
                  type="tel"
                  placeholder="Telefon *"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#1E3A5F] outline-none"
                  required
                />
                <textarea
                  placeholder="Teslimat Adresi *"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#1E3A5F] outline-none resize-none"
                  required
                />
                <textarea
                  placeholder="Sipariş Notu (İsteğe bağlı)"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#1E3A5F] outline-none resize-none"
                />
              </div>

              <button
                onClick={handleCheckout}
                disabled={isSending}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/30 hover:scale-[1.02] disabled:opacity-70"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sipariş Oluşturuluyor...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5" />
                    <span>WhatsApp ile Sipariş Ver</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Siparişiniz kaydedilecek ve WhatsApp üzerinden iletilecektir
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}