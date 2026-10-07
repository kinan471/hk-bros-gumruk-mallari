'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';

export default function ProductFavoriteButton() {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setIsFavorite((favorite) => !favorite)}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${
        isFavorite
          ? 'border-[#f1d8d5] bg-[#f8ecea] text-[#8c332b]'
          : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`}
      aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
      aria-pressed={isFavorite}
    >
      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
    </button>
  );
}
