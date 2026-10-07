'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Tag, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Product } from '@/types/database';

type SliderProduct = Pick<
  Product,
  'id' | 'name' | 'slug' | 'main_image' | 'short_description' | 'is_on_sale' | 'sale_price' | 'regular_price'
>;

export default function HeroSlider({ sliderProducts }: { sliderProducts: SliderProduct[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (sliderProducts.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const intervalId = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % sliderProducts.length);
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [sliderProducts]);

  if (sliderProducts.length === 0) return null;

  const currentProduct = sliderProducts[currentSlide];
  const hasDiscount = Boolean(
    currentProduct.is_on_sale &&
    currentProduct.sale_price !== null &&
    currentProduct.regular_price !== null &&
    currentProduct.sale_price < currentProduct.regular_price
  );
  const discountPercentage = hasDiscount 
    ? Math.round((1 - (currentProduct.sale_price || 0) / (currentProduct.regular_price || 1)) * 100) 
    : 0;

  return (
    <section aria-label="Öne çıkan ürünler" className="mt-4 w-full px-3 mb-5 sm:mt-6 sm:px-6 sm:mb-8 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-gray-100 bg-[#f6f4ef] shadow-sm sm:rounded-3xl">
        <div
          key={currentProduct.id}
          className="grid h-[260px] grid-cols-[1fr_1fr] gap-0 overflow-hidden animate-[hero-slide-in_700ms_cubic-bezier(0.22,1,0.36,1)] sm:h-64 md:h-72 lg:h-[400px]"
        >
          {/* Image Section - تم ضبط object-contain لإظهار الصورة كاملة */}
          <div className="relative h-full min-h-0 overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
            <Image
              src={currentProduct.main_image}
              alt={currentProduct.name}
              fill
              sizes="(max-width: 1024px) 55vw, 50vw"
              className="object-contain p-2"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 lg:bg-gradient-to-r lg:from-transparent lg:to-white/20" />
          </div>

          {/* Content Section */}
          <div className="flex h-full min-h-0 min-w-0 items-center overflow-hidden p-3 sm:p-5 md:p-7 lg:p-12">
            <div className="flex w-full min-w-0 flex-col justify-center gap-2 sm:gap-3 lg:gap-4">
              {/* Badges */}
              <div className="flex h-4 items-center gap-1 overflow-hidden sm:h-6 sm:gap-2 lg:h-7">
                {hasDiscount && (
                  <div className="inline-flex items-center gap-1 bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold text-[8px] sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-sm shadow-lg">
                    <Zap className="w-2.5 h-2.5 sm:w-4 sm:h-4 fill-current" />
                    <span>%{discountPercentage} İndirim</span>
                  </div>
                )}
                {currentProduct.is_on_sale && (
                  <div className="inline-flex items-center gap-1 bg-[#E8B04B] text-[#1E3A5F] px-1.5 py-0.5 rounded-full font-bold text-[8px] sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-sm shadow-lg">
                    <Tag className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                    <span>Fırsat</span>
                  </div>
                )}
              </div>
              
              {/* Product Name - تم إزالة حظر الارتفاع الثابت وتصغير حجم الخط لتجنب القص */}
              <div className="flex items-center min-w-0">
                <h2 className="text-xs font-semibold leading-snug text-gray-900 line-clamp-2 sm:text-lg md:text-xl lg:text-3xl xl:text-4xl">
                  {currentProduct.name}
                </h2>
              </div>

              {/* Short Description */}
              <div className="flex items-center min-w-0">
                {currentProduct.short_description && (
                  <p className="text-[10px] leading-snug text-gray-600 line-clamp-2 sm:text-xs md:text-sm lg:text-base">
                    {currentProduct.short_description}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center">
                {hasDiscount ? (
                  <div className="flex items-baseline gap-1 sm:gap-3">
                    <span className="text-base font-semibold text-[#8c332b] sm:text-2xl lg:text-3xl">₺{currentProduct.sale_price}</span>
                    <span className="text-[10px] text-gray-500 line-through sm:text-sm lg:text-lg">₺{currentProduct.regular_price}</span>
                  </div>
                ) : (
                  <span className="text-base font-semibold text-gray-900 sm:text-2xl lg:text-3xl">
                    ₺{currentProduct.regular_price ?? '0'}
                  </span>
                )}
              </div>

              {/* CTA Button */}
              <div>
                <Link
                  href={`/products/${currentProduct.slug}`}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1.5 text-[10px] font-semibold text-white shadow-sm transition-colors hover:bg-gray-700 sm:gap-2 sm:px-5 sm:py-2 sm:text-xs lg:px-7 lg:py-2.5 lg:text-sm"
                >
                  Ürünü İncele
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Counter - تم إزالة أزرار الأسهم والإبقاء على العداد فقط */}
        {sliderProducts.length > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center sm:bottom-4 sm:right-4">
            <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] sm:text-xs font-medium text-gray-700 shadow-sm" aria-live="polite">
              {currentSlide + 1} / {sliderProducts.length}
            </span>
          </div>
        )}

        <div className="absolute bottom-4 left-4 flex gap-2">
          {sliderProducts.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-8 bg-gray-900' : 'w-2.5 bg-gray-400 hover:bg-gray-600'
              }`}
              aria-label={`Ürün ${index + 1}`}
              aria-current={index === currentSlide ? 'true' : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}