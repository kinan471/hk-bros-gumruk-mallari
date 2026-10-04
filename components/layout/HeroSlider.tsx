'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const heroSlides = [
  {
    id: 1,
    title: 'Yeni Sezon Ürünleri',
    subtitle: 'En son teknoloji ve moda trendleri',
    cta: 'Keşfet',
    link: '/category/telefonlar-aksesuarlar',
    bg: 'from-[#1E3A5F] via-[#2C5282] to-[#4A90A4]',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
  },
  {
    id: 2,
    title: 'Büyük İndirim Festivali',
    subtitle: 'Seçili ürünlerde %50\'ye varan indirimler',
    cta: 'İndirimleri Gör',
    link: '/search?q=indirim',
    bg: 'from-red-600 via-red-500 to-orange-500',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80',
  },
  {
    id: 3,
    title: 'Premium Kalite',
    subtitle: 'Orijinal ürünler, garantili alışveriş',
    cta: 'Ürünleri İncele',
    link: '/products',
    bg: 'from-[#E8B04B] via-[#F5C06B] to-[#E8B04B]',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80',
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (isPaused) return;

    // ✅ تم زيادة الوقت إلى 5000ms لتقليل استهلاك موارد المتصفح
    const timer = setInterval(() => {
      goToNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, goToNext]);

  return (
    <section 
      className="relative h-[500px] sm:h-[600px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`min-w-full h-full relative bg-gradient-to-r ${slide.bg} flex items-center flex-shrink-0`}
          >
            <div className="absolute inset-0 opacity-20">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                // ✅ الإصلاح 1: فقط الشريحة الأولى تحصل على أولوية التحميل (LCP)
                priority={index === 0}
                // ✅ الإصلاح 2: إخبار المتصفح بحجم الصورة لتحميل الدقة المناسبة للجوال
                sizes="100vw"
                // ✅ الإصلاح 3: ضغط الصورة تلقائياً بنسبة 15% لتسريع التحميل
                quality={85}
              />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl text-white">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 fill-current text-[#E8B04B]" />
                  <span className="text-sm font-semibold uppercase tracking-wider">
                    HK BROS Özel
                  </span>
                </div>
                <h1 className="text-4xl sm:text-6xl font-bold mb-4 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-lg sm:text-xl mb-8 text-white/90">
                  {slide.subtitle}
                </p>
                <Link
                  href={slide.link}
                  className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full font-bold hover:bg-[#E8B04B] hover:text-white transition-all duration-300 shadow-2xl hover:scale-105"
                >
                  {slide.cta}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            <div className="absolute right-0 top-0 w-1/3 h-full opacity-10">
              <div className="absolute inset-0 bg-white rounded-full blur-3xl transform translate-x-1/2" />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition-colors"
        aria-label="Önceki slayt"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition-colors"
        aria-label="Sonraki slayt"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-3 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-white w-8' 
                : 'bg-white/50 w-3 hover:bg-white'
            }`}
            aria-label={`Slayt ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}