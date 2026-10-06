'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

interface OrderProduct {
  id: string;
  name: string;
  slug: string;
  regular_price: number | null;
  sale_price: number | null;
  product_condition?: string | null;
}

interface OrderButtonProps {
  product: OrderProduct;
}

export default function OrderButton({ product }: OrderButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOrder = async () => {
    setIsProcessing(true);
    const supabase = createClient();

    try {
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
      const currentPrice = product.sale_price || product.regular_price;
      const condition = product.product_condition || 'Belirtilmemiş';
      
      const orderData = {
        order_number: orderNumber,
        customer_name: 'Müşteri (WhatsApp)',
        customer_phone: '',
        customer_address: '',
        items: [{
          product_id: product.id,
          name: product.name,
          quantity: 1,
          price: currentPrice
        }],
        total_amount: currentPrice,
        status: 'pending',
        payment_status: 'pending',
        source: 'website',
        notes: `Ürün: ${product.name}\nDurum: ${condition}\nLink: ${window.location.href}`
      };

      const { error } = await supabase.from('orders').insert([orderData]);
      if (error) {
        console.error('Sipariş kaydedilemedi:', error);
      }

      const message = `Merhaba HK BROS, web sitenizdeki aşağıdaki ürün hakkında bilgi almak ve sipariş vermek istiyorum.%0A%0A` +
        `📦 *Ürün:* ${product.name}%0A` +
        ` *Fiyat:* ₺${currentPrice}%0A` +
        `🏷️ *Durum:* ${condition}%0A` +
        `🔗 *Link:* ${window.location.href}%0A%0A` +
        `Sipariş No: ${orderNumber}%0A` +
        `Teşekkürler.`;

      const whatsappUrl = `https://wa.me/905314319921?text=${message}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Hata:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleOrder}
      disabled={isProcessing}
      className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/30 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isProcessing ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      )}
      <span>{isProcessing ? 'Hazırlanıyor...' : 'WhatsApp ile Sipariş Ver'}</span>
    </button>
  );
}