'use client';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart/CartContext';

export default function CartIcon() {
  const { totalItems } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`Sepet (${totalItems} ürün)`}
      className="relative p-2.5 rounded-full border border-gray-100 hover:border-[#E8B04B]/50 hover:bg-[#E8B04B]/10 transition-colors"
    >
      <ShoppingCart className="w-5 h-5 text-[#1E3A5F]" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  );
}