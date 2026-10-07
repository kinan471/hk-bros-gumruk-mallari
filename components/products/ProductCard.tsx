'use client';
import { useState } from 'react';
import Image from 'next/image';
import { ImageIcon, Star } from 'lucide-react';
import type { ProductCardProduct } from '@/types/database';
import type { ReviewSummary } from '@/lib/utils/reviewSummaries';
import Link from 'next/link';

interface ProductCardProps {
  product: ProductCardProduct;
  reviewSummary?: ReviewSummary;
}

export default function ProductCard({ product, reviewSummary }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const avgRating = reviewSummary?.averageRating ?? 0;
  const reviewCount = reviewSummary?.reviewCount ?? 0;

  const hasDiscount = product.sale_price && product.sale_price < (product.regular_price || 0);
  const discountPercentage = hasDiscount
    ? Math.round((1 - (product.sale_price || 0) / (product.regular_price || 1)) * 100)
    : 0;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-lg">
      <Link
        href={`/products/${product.slug}`}
        aria-label={`${product.name} ürününü incele`}
        className="relative block aspect-[4/3] overflow-hidden bg-[#f6f5f1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#1E3A5F] sm:aspect-square"
      >
        {!imageLoaded && !imageFailed && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
        )}
        {imageFailed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400" role="img" aria-label={`Görsel yüklenemedi: ${product.name}`}>
            <ImageIcon className="h-8 w-8" />
            <span className="text-xs">Görsel yüklenemedi</span>
          </div>
        ) : (
          <Image
            src={product.main_image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04] sm:p-6 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageFailed(true)}
          />
        )}
        
        {hasDiscount && (
          <span className="absolute -left-8 top-4 z-10 flex w-32 -rotate-45 items-center justify-center bg-[#8c332b] py-1 text-[10px] font-semibold text-white shadow-sm sm:left-3 sm:top-3 sm:w-auto sm:rotate-0 sm:rounded-full sm:px-2.5 sm:py-1 sm:text-[10px]">
            %{discountPercentage} İndirim
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {product.brand && (
          <p className="mb-1.5 truncate text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-500 sm:text-[10px]">
            {product.brand}
          </p>
        )}
        
        <Link href={`/products/${product.slug}`} className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1E3A5F]">
          <h3 className="mb-2 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-gray-950 transition-colors group-hover:text-[#1E3A5F] sm:text-base">
            {product.name}
          </h3>
        </Link>

        {reviewCount > 0 && (
          <div className="mb-2 flex items-center gap-1" aria-label={`${avgRating} / 5 (${reviewCount} yorum)`}>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= Math.round(avgRating)
                      ? 'text-[#E8B04B] fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-500">{avgRating} · {reviewCount} yorum</span>
          </div>
        )}

        <div className="mt-auto border-t border-gray-100 pt-2.5 sm:pt-3">
          <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            {hasDiscount ? (
              <>
                <span className="text-lg font-semibold tracking-tight text-[#8c332b] sm:text-xl">₺{product.sale_price}</span>
                <span className="text-[10px] text-gray-400 line-through sm:text-xs">₺{product.regular_price}</span>
              </>
            ) : (
              <span className="text-lg font-semibold tracking-tight text-gray-950 sm:text-xl">₺{product.regular_price || '0'}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}