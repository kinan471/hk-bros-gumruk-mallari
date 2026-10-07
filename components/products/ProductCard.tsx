'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Heart, ImageIcon, Star, Tag, Zap, Truck } from 'lucide-react';
import type { ProductCardProduct } from '@/types/database';
import type { ReviewSummary } from '@/lib/utils/reviewSummaries';
import Link from 'next/link';

interface ProductCardProps {
  product: ProductCardProduct;
  reviewSummary?: ReviewSummary;
}

export default function ProductCard({ product, reviewSummary }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const avgRating = reviewSummary?.averageRating ?? 0;
  const reviewCount = reviewSummary?.reviewCount ?? 0;

  const hasDiscount = product.sale_price && product.sale_price < (product.regular_price || 0);
  const discountPercentage = hasDiscount
    ? Math.round((1 - (product.sale_price || 0) / (product.regular_price || 1)) * 100)
    : 0;
  const isLowStock = product.track_inventory && product.stock_quantity > 0 && product.stock_quantity <= 5;
  const productCondition = product.product_condition;

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const getConditionStyle = (condition: string) => {
    if (condition.includes('Sıfır')) return 'bg-green-100 text-green-700 border-green-200';
    if (condition.includes('Kutu Açılmış')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (condition.includes('Teşhir')) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getConditionIcon = (condition: string) => {
    if (condition.includes('Sıfır')) return '🟢';
    if (condition.includes('Kutu Açılmış')) return '🟡';
    if (condition.includes('Teşhir')) return '🟠';
    return '🟤';
  };

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
        
        <div className="absolute left-2.5 top-2.5 z-10 flex flex-col items-start gap-1.5 sm:left-3 sm:top-3">
          {product.is_featured && (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-semibold text-gray-700 shadow-sm backdrop-blur sm:text-[10px]">
              Öne çıkan
            </span>
          )}
          {hasDiscount && (
            <span className="flex items-center gap-1 rounded-full bg-[#8c332b] px-2.5 py-1 text-[9px] font-semibold text-white shadow-sm sm:text-[10px]">
              <Tag className="h-2.5 w-2.5" />
              %{discountPercentage} indirim
            </span>
          )}
        </div>
        {product.product_type === 'physical' && (
          <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[9px] font-medium text-gray-700 shadow-sm backdrop-blur sm:bottom-3 sm:left-3 sm:px-2.5 sm:text-[10px]">
            <Truck className="h-3 w-3" />
            Fiziksel ürün
          </div>
        )}
      </Link>

      <button
        type="button"
        onClick={handleFavorite}
        className={`absolute right-2.5 top-2.5 z-20 flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur transition-colors sm:right-3 sm:top-3 ${
          isFavorite ? 'bg-[#8c332b] text-white' : 'bg-white/95 text-gray-700 hover:bg-white'
        }`}
        aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
        aria-pressed={isFavorite}
      >
        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
      </button>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {product.brand && (
          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-500 sm:text-[10px]">
            {product.brand}
          </p>
        )}
        
        <Link href={`/products/${product.slug}`} className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1E3A5F]">
          <h3 className="mb-2 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-gray-950 transition-colors group-hover:text-[#1E3A5F] sm:text-base">
            {product.name}
          </h3>
        </Link>

        {productCondition && (
          <div className={`mb-2 inline-flex w-fit items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-medium sm:text-[10px] ${getConditionStyle(productCondition)}`}>
            <span>{getConditionIcon(productCondition)}</span>
            <span>{productCondition}</span>
          </div>
        )}

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
          
          {isLowStock && (
            <p className="mb-2 flex items-center gap-1 text-[9px] font-medium text-[#8c332b] sm:text-[10px]">
              <Zap className="h-3 w-3 fill-current" />
              Son {product.stock_quantity} ürün
            </p>
          )}

          {product.track_inventory && (
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${
                product.stock_status === 'in_stock' ? 'bg-green-500' :
                product.stock_status === 'out_of_stock' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className={`text-[9px] font-medium sm:text-[10px] ${
                product.stock_status === 'in_stock' ? 'text-green-600' :
                product.stock_status === 'out_of_stock' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {product.stock_status === 'in_stock' && 'Stokta Var'}
                {product.stock_status === 'out_of_stock' && 'Tükendi'}
                {product.stock_status === 'pre_order' && 'Ön Sipariş'}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}