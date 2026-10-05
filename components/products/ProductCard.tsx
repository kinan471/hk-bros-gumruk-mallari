'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Heart, Star, Flame, Zap, Truck } from 'lucide-react';
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
  const avgRating = reviewSummary?.averageRating ?? 0;
  const reviewCount = reviewSummary?.reviewCount ?? 0;

  const hasDiscount = product.sale_price && product.sale_price < (product.regular_price || 0);
  const discountPercentage = hasDiscount
    ? Math.round((1 - (product.sale_price || 0) / (product.regular_price || 1)) * 100)
    : 0;
  const isLowStock = product.track_inventory && product.stock_quantity > 0 && product.stock_quantity <= 5;
  const stockPercentage = product.track_inventory && product.stock_quantity > 0
    ? Math.min((product.stock_quantity / 50) * 100, 100)
    : 100;

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
    <Link
      href={`/products/${product.slug}`}
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full"
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
        )}
        <Image
          src={product.main_image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover group-hover:scale-110 transition-transform duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.is_featured && (
            <span className="flex items-center gap-1 bg-gradient-to-r from-[#E8B04B] to-[#F5C06B] text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
              <Star className="w-3 h-3 fill-current" />
              Öne Çıkan
            </span>
          )}
          {hasDiscount && (
            <span className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-lg animate-pulse">
              <Flame className="w-3 h-3" />
              %{discountPercentage} İndirim
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

        {product.product_type === 'physical' && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-green-500/95 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <Truck className="w-3 h-3" />
            Hızlı Teslimat
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {product.brand && (
          <p className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
            {product.brand}
          </p>
        )}
        
        <h3 className="font-bold text-gray-900 mb-1.5 text-sm sm:text-base line-clamp-2 group-hover:text-[#1E3A5F] transition-colors leading-snug min-h-[2.5rem]">
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
                  Son {product.stock_quantity} ürün!
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

          {product.track_inventory && (
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${
                product.stock_status === 'in_stock' ? 'bg-green-500' :
                product.stock_status === 'out_of_stock' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className={`text-[10px] font-medium ${
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
    </Link>
  );
}