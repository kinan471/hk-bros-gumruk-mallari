'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { CartProvider } from '@/lib/cart/CartContext';
import { PopupProvider } from '@/components/ui/PopupProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <PopupProvider>
      <CartProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </CartProvider>
    </PopupProvider>
  );
}