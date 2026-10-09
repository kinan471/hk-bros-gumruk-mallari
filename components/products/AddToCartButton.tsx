'use client';
import { useState } from 'react';
import { ShoppingCart, Check, Minus, Plus } from 'lucide-react';
import { useCart } from '@/lib/cart/CartContext';

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    slug: string;
    regular_price: number | null;
    sale_price: number | null;
    main_image: string;
    product_condition?: string | null;
    track_inventory?: boolean;
    stock_status?: string;
    stock_quantity?: number;
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem, items, updateQuantity } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const currentPrice = product.sale_price || product.regular_price || 0;
  const cartItem = items.find(item => item.id === product.id);
  const isInCart = !!cartItem;
  const isOutOfStock =
    product.track_inventory === true &&
    (product.stock_status === 'out_of_stock' ||
      (product.stock_status !== 'pre_order' && (product.stock_quantity ?? 0) <= 0));

  const handleAdd = () => {
    if (isOutOfStock) return;
    
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: currentPrice,
      regularPrice: product.regular_price || undefined,
      image: product.main_image,
      condition: product.product_condition || undefined,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  if (isOutOfStock) {
    return (
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-500 px-6 py-4 rounded-xl font-semibold cursor-not-allowed"
      >
        <ShoppingCart className="w-5 h-5" />
        <span>Stokta Yok</span>
      </button>
    );
  }

  if (isInCart) {
    return (
      <div className="flex items-center gap-2 bg-[#1E3A5F]/5 border border-[#1E3A5F]/20 rounded-xl p-2">
        <button
          onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-white hover:bg-gray-50 transition-colors"
          aria-label="Azalt"
        >
          <Minus className="w-4 h-4 text-[#1E3A5F]" />
        </button>
        <span className="flex-1 text-center font-bold text-[#1E3A5F] text-lg">
          {cartItem.quantity}
        </span>
        <button
          onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-white hover:bg-gray-50 transition-colors"
          aria-label="Artır"
        >
          <Plus className="w-4 h-4 text-[#1E3A5F]" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl font-semibold transition-all shadow-sm ${
        isAdded
          ? 'bg-emerald-500 text-white'
          : 'bg-[#1E3A5F] text-white hover:bg-[#1A3354] hover:shadow-md active:scale-[0.98]'
      }`}
    >
      {isAdded ? (
        <>
          <Check className="w-5 h-5" />
          <span>Sepete Eklendi</span>
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          <span>Sepete Ekle</span>
        </>
      )}
    </button>
  );
}