'use client';

import dynamic from 'next/dynamic';
import { useCart } from '@/lib/cart/CartContext';

const MiniCart = dynamic(() => import('@/components/layout/MiniCart'));

export default function MiniCartLoader() {
  const { isOpen } = useCart();

  return isOpen ? <MiniCart /> : null;
}
