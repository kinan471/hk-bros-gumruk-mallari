'use client';
import { X, ShoppingBag, Trash2, Plus, Minus, MessageCircle } from 'lucide-react';
import { useCart } from '@/lib/cart/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { STORE_SHIPPING } from '@/lib/config/store';

export default function MiniCart() {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    totalPrice,
    totalItems,
    isOpen,
    setIsOpen,
  } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#1E3A5F]" />
            <h2 className="text-lg font-bold text-gray-900">Sepetim</h2>
            <span className="px-2 py-0.5 bg-[#1E3A5F] text-white text-xs font-semibold rounded-full">
              {totalItems}
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium mb-2">Sepetiniz boş</p>
              <p className="text-sm text-gray-400 mb-6">Hemen alışverişe başlayın</p>
              <Link
                href="/products"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-2 bg-[#1E3A5F] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1A3354] transition-colors"
              >
                <span>Ürünlere Göz At</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="relative w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-[#1E3A5F] transition-colors"
                    >
                      {item.name}
                    </Link>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 bg-white rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                          aria-label="Azalt"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                          aria-label="Artır"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <p className="font-bold text-[#1E3A5F] text-sm">
                        ₺{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors self-start"
                    aria-label="Kaldır"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Ara Toplam</span>
              <span className="text-xl font-bold text-[#1E3A5F]">₺{totalPrice.toFixed(2)}</span>
            </div>

            {totalPrice < STORE_SHIPPING.freeShippingMinimum && (
              <p className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded-lg text-center">
                ₺{(STORE_SHIPPING.freeShippingMinimum - totalPrice).toFixed(2)} daha ekleyin, kargo ücretsiz olsun!
              </p>
            )}

            <Link
              href="/cart"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center bg-[#1E3A5F] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1A3354] transition-colors"
            >
              Sepeti Görüntüle
            </Link>

            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/cart');
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Siparişi Tamamla</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}