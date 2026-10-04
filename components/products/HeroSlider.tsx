'use client';

import { useQuery } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import { ArrowRight, Tag } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/types/database';
import Link from 'next/link';
import Image from 'next/image';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

export default function HeroSlider() {
  const supabase = createClient();

  const { data: sliderProducts, isLoading } = useQuery({
    queryKey: ['slider-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_slider', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data as Product[];
    },
  });

  if (isLoading) {
    return <div className="w-full h-[350px] sm:h-[450px] md:h-[500px] bg-gray-100 animate-pulse rounded-2xl" />;
  }

  if (!sliderProducts || sliderProducts.length === 0) {
    return (
      <div className="w-full h-[350px] sm:h-[450px] md:h-[500px] bg-gradient-to-r from-[#1E3A5F] to-[#4A90A4] rounded-2xl flex items-center justify-center text-white px-4">
        <div className="text-center">
          <h2 className="text-2xl sm:text-4xl font-bold mb-4">Henüz Öne Çıkan Ürün Yok</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true, dynamicBullets: true }}
        navigation={true}
        effect="fade"
        loop={true}
        className="h-[350px] sm:h-[450px] md:h-[500px] rounded-2xl overflow-hidden"
      >
        {sliderProducts.map((product, index) => (
          <SwiperSlide key={product.id}>
            <div className="relative h-full w-full">
              <Image
                src={product.main_image}
                alt={product.name}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent sm:via-black/40" />

              <div className="relative h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-xl sm:max-w-2xl text-white">
                    {product.is_on_sale && (
                      <div className="inline-flex items-center gap-2 bg-[#E8B04B] text-[#1E3A5F] px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold text-xs sm:text-sm mb-3 sm:mb-4">
                        <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>İndirim</span>
                      </div>
                    )}
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
                      {product.name}
                    </h2>
                    {product.short_description && (
                      <p className="text-sm sm:text-xl mb-6 sm:mb-8 text-gray-200 line-clamp-2 sm:line-clamp-3">
                        {product.short_description}
                      </p>
                    )}
                    <Link 
                      href={`/products/${product.slug}`}
                      className="inline-flex items-center gap-2 bg-white text-[#1E3A5F] px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-sm sm:text-base hover:bg-[#E8B04B] hover:text-white transition-all duration-300 group"
                    >
                      <span>Ürünü İncele</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}