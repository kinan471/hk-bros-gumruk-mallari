'use client';
import { useSyncExternalStore } from 'react';
import Image from 'next/image';
import { Heart, Star, Sparkles, BadgePercent, Zap } from 'lucide-react';
import type { ProductCardProduct } from '@/types/database';
import type { ReviewSummary } from '@/lib/utils/reviewSummaries';
import { getFavoriteIds, saveFavoriteIds, subscribeToFavorites } from '@/lib/utils/wishlist';
import Link from 'next/link';
import { IMAGE_BLUR_DATA_URL } from '@/lib/utils/imagePlaceholder';

interface ProductCardProps {
  product: ProductCardProduct;
  reviewSummary: ReviewSummary;
  preload?: boolean;
}

export default function ProductCard({ product, reviewSummary, preload = false }: ProductCardProps) {
  const isFavorite = useSyncExternalStore(
    subscribeToFavorites,
    () => getFavoriteIds().includes(product.id),
    () => false
  );
  const avgRating = reviewSummary.averageRating;
  const reviewCount = reviewSummary.reviewCount;

  const hasDiscount = product.sale_price && product.sale_price < (product.regular_price || 0);
  const discountPercentage = hasDiscount
    ? Math.round((1 - (product.sale_price || 0) / (product.regular_price || 1)) * 100)
    : 0;
  const stockQuantity = product.stock_quantity ?? 0;
  const isOutOfStock =
    product.track_inventory === true &&
    (product.stock_status === 'out_of_stock' ||
      (product.stock_status !== 'pre_order' && stockQuantity <= 0));
  const isPreOrder = product.track_inventory === true && product.stock_status === 'pre_order';
  const isLowStock = product.track_inventory === true && stockQuantity > 0 && stockQuantity <= 5;
  const stockPercentage = product.track_inventory === true && stockQuantity > 0
    ? Math.min((stockQuantity / 50) * 100, 100)
    : 100;

  const productCondition = product.product_condition;

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const currentIds = getFavoriteIds();
    const nextIds = isFavorite
      ? currentIds.filter((id) => id !== product.id)
      : [...currentIds, product.id];
    saveFavoriteIds(nextIds);
  };

  // تحديد لون الشارة بناءً على الحالة
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
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:border-[#9bbcb6] hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        <Image
          src={product.main_image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 230px"
          preload={preload}
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_DATA_URL}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 z-10 flex max-w-[calc(100%-4.5rem)] flex-col items-start gap-1.5">
          {product.is_featured && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-2.5 py-1.5 text-[10px] font-semibold text-[#31566b] shadow-sm backdrop-blur-md sm:text-xs">
              <Sparkles className="h-3.5 w-3.5 text-[#bd9148]" />
              Öne Çıkan
            </span>
          )}
          {hasDiscount && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-100/90 bg-rose-50/95 px-2.5 py-1.5 text-rose-700 shadow-sm backdrop-blur-md">
              <BadgePercent className="h-3.5 w-3.5 shrink-0 text-rose-500" />
              <span className="text-[11px] font-bold leading-none sm:text-xs">%{discountPercentage} İndirim</span>
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button
            onClick={handleFavorite}
            className={`p-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white/95 text-gray-700 hover:bg-white'
            }`}
            aria-label="Favorilere ekle"
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {product.brand && (
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-gray-400 sm:text-xs">
            {product.brand}
          </p>
        )}

        <h3 className="mb-1.5 min-h-[2.5rem] text-sm font-semibold leading-snug text-gray-900 transition-colors group-hover:text-[#1E3A5F] sm:text-base">
          {product.name}
        </h3>

        {productCondition && (
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold mb-2 border ${getConditionStyle(productCondition)} w-fit`}>
            <span>{getConditionIcon(productCondition)}</span>
            <span>{productCondition}</span>
          </div>
        )}

        <div className="flex items-center gap-1 mb-2">
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
          {reviewCount > 0 ? (
            <span className="text-[10px] text-gray-500">({avgRating}) • {reviewCount} yorum</span>
          ) : (
            <span className="text-[10px] text-gray-400">Henüz yorum yok</span>
          )}
        </div>

        <div className="mt-auto pt-2 border-t border-gray-100">
          <div className="flex items-baseline gap-2 mb-1.5">
            {hasDiscount ? (
              <>
                <span className="text-xl sm:text-2xl font-bold text-red-600">₺{product.sale_price}</span>
                <span className="text-xs text-gray-400 line-through">₺{product.regular_price}</span>
              </>
            ) : (
              <span className="text-xl sm:text-2xl font-bold text-[#1E3A5F]">₺{product.regular_price || '0'}</span>
            )}
          </div>

          {isLowStock && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-current" />
                  Son {stockQuantity} ürün!
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-1000"
                  style={{ width: `${stockPercentage}%` }}
                />
              </div>
            </div>
          )}

          {product.track_inventory === true && (
            <div className="flex items-center gap-1.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isOutOfStock ? 'bg-red-500' : isPreOrder ? 'bg-yellow-500' : 'bg-green-500'
                }`}
              />
              <span
                className={`text-[10px] font-medium ${
                  isOutOfStock ? 'text-red-600' : isPreOrder ? 'text-yellow-600' : 'text-green-600'
                }`}
              >
                {isOutOfStock
                  ? 'Tükendi'
                  : isPreOrder
                    ? 'Ön Sipariş'
                    : `Stokta Var${stockQuantity > 0 ? ` (${stockQuantity} adet)` : ''}`}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}