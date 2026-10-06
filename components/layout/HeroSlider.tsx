'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/types/database';
import Link from 'next/link';
import Image from 'next/image';
import { Tag, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function HeroSlider() {
  const supabase = createClient();
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: sliderProducts, isLoading } = useQuery({
    queryKey: ['slider-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, main_image, short_description, is_on_sale, sale_price, regular_price')
        .eq('is_slider', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data as Product[];
    },
  });

  useEffect(() => {
    if (!sliderProducts || sliderProducts.length < 2) return;

    const intervalId = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % sliderProducts.length);
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [sliderProducts]);

  if (isLoading) {
    return (
      <div className="mt-4 w-full px-3 mb-5 sm:mt-6 sm:px-6 sm:mb-8 lg:px-8">
        <div className="mx-auto h-40 max-w-7xl animate-pulse rounded-2xl bg-gray-100 sm:h-48 sm:rounded-3xl md:h-64 lg:h-[400px]" />
      </div>
    );
  }

  if (!sliderProducts || sliderProducts.length === 0) {
    return null;
  }

  const currentProduct = sliderProducts[currentSlide];
  const hasDiscount = currentProduct.is_on_sale && currentProduct.sale_price && currentProduct.regular_price;
  const discountPercentage = hasDiscount 
    ? Math.round((1 - (currentProduct.sale_price || 0) / (currentProduct.regular_price || 1)) * 100) 
    : 0;

  return (
    <div className="mt-4 w-full px-3 mb-5 sm:mt-6 sm:px-6 sm:mb-8 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-r from-gray-50 to-blue-50 sm:rounded-3xl">
        <div
          key={currentProduct.id}
          className="grid h-40 grid-cols-[1.1fr_0.9fr] gap-0 overflow-hidden animate-[hero-slide-in_700ms_cubic-bezier(0.22,1,0.36,1)] sm:h-48 md:h-64 lg:h-[400px]"
        >
          {/* Image Section */}
          <div className="relative h-full min-h-0 overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
            <Image
              src={currentProduct.main_image}
              alt={currentProduct.name}
              fill
              sizes="(max-width: 1024px) 55vw, 50vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 lg:bg-gradient-to-r lg:from-transparent lg:to-white/20" />
          </div>

          {/* Content Section */}
          <div className="flex h-full min-h-0 min-w-0 items-center overflow-hidden p-2 sm:p-3 md:p-4 lg:p-12">
            <div className="flex w-full min-w-0 flex-col justify-center gap-1 sm:gap-1.5 lg:gap-3">
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
              
              {/* Product Name */}
              <div className="flex h-8 items-center overflow-hidden sm:h-9 md:h-12 lg:h-20">
                <h2 className="text-xs font-black leading-tight text-gray-900 line-clamp-2 sm:text-base md:text-xl lg:text-4xl xl:text-5xl">
                  {currentProduct.name}
                </h2>
              </div>

              {/* Short Description */}
              <div className="flex h-7 items-center overflow-hidden sm:h-8 md:h-10 lg:h-12">
                {currentProduct.short_description && (
                <p className="text-[9px] leading-snug text-gray-600 line-clamp-2 sm:text-xs sm:leading-relaxed lg:text-base">
                  {currentProduct.short_description}
                </p>
                )}
              </div>

              {/* Price */}
              <div className="flex h-5 items-center sm:h-7 md:h-9 lg:h-10">
                {hasDiscount && (
                <div className="flex items-baseline gap-1 sm:gap-3">
                  <span className="text-sm sm:text-2xl lg:text-4xl font-bold text-red-600">₺{currentProduct.sale_price}</span>
                  <span className="text-[10px] sm:text-base lg:text-xl text-gray-400 line-through">₺{currentProduct.regular_price}</span>
                </div>
                )}
              </div>

              {/* CTA Button */}
              <Link 
                href={`/products/${currentProduct.slug}`}
                className="inline-flex items-center gap-1 bg-gray-900 text-white px-2.5 py-1.5 sm:gap-2 sm:px-6 sm:py-2.5 lg:px-10 lg:py-4 rounded-full font-bold text-[9px] sm:text-xs lg:text-base hover:bg-gray-800 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
              >
                Ürünü İncele
              </Link>
            </div>
          </div>
        </div>

        {/* Slide Counter */}
        <div className="absolute right-2 top-2 bg-gray-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-semibold sm:right-4 sm:top-3 sm:px-3 sm:py-1.5 sm:text-sm lg:top-auto lg:bottom-4 lg:px-4 lg:py-2">
          {currentSlide + 1} / {sliderProducts.length}
        </div>

        {/* Slide Indicators */}
        <div className="absolute left-3 top-[9.25rem] flex gap-2 sm:left-4 sm:top-[10.75rem] md:top-[15.25rem] lg:top-auto lg:bottom-4">
          {sliderProducts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 sm:h-2 ${
                index === currentSlide
                  ? 'w-6 bg-gray-900 sm:w-8'
                  : 'w-1.5 bg-gray-400 hover:bg-gray-500 sm:w-2'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}