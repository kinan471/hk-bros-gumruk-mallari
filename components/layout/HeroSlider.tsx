'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';

const slides = [
  {
    eyebrow: 'HK BROS fırsatları',
    title: 'Aradığınız ürün, doğru fiyatla.',
    description: 'Elektronikten ev yaşamına, özenle seçilmiş ürünleri keşfedin.',
    cta: 'Tüm ürünleri keşfet',
    href: '/products',
    icon: BadgePercent,
    accent: 'from-[#15374b] via-[#1d5968] to-[#39766e]',
    decor: 'bg-[#f3c56b]',
  },
  {
    eyebrow: 'Her gün yeni fırsatlar',
    title: 'Alışverişinize değer katın.',
    description: 'Seçili ürünlerdeki güncel fiyatları ve fırsatları inceleyin.',
    cta: 'İndirimleri gör',
    href: '/search?q=indirim',
    icon: Sparkles,
    accent: 'from-[#3b2547] via-[#694265] to-[#a56668]',
    decor: 'bg-[#f7c4a4]',
  },
  {
    eyebrow: 'Güvenle alışveriş yapın',
    title: 'Siparişinizin her adımını takip edin.',
    description: 'Sipariş durumu ve teslimat bilgileri elinizin altında.',
    cta: 'Siparişimi takip et',
    href: '/siparis-takip',
    icon: ShieldCheck,
    accent: 'from-[#193c51] via-[#2d6574] to-[#7ca89a]',
    decor: 'bg-[#d9e6ad]',
  },
  {
    eyebrow: 'Kapınıza kadar',
    title: 'Yeni favoriniz bir tık uzağınızda.',
    description: 'Koleksiyonumuza göz atın, size uygun ürünü kolayca bulun.',
    cta: 'Alışverişe başla',
    href: '/products',
    icon: Truck,
    accent: 'from-[#44351f] via-[#80613a] to-[#c49654]',
    decor: 'bg-[#f7dd9b]',
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = useCallback(() => {
    setCurrentSlide((previous) => (previous + 1) % slides.length);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentSlide((previous) => (previous - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(goToNext, 6000);
    return () => window.clearInterval(timer);
  }, [goToNext, isPaused]);

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <section
      aria-label="Öne çıkan fırsatlar"
      aria-roledescription="carousel"
      className="relative overflow-hidden bg-[#e3e6e6] px-3 pb-5 sm:px-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
      }}
    >
      <div
        className={`relative mx-auto mt-4 flex min-h-[320px] max-w-[1440px] overflow-hidden rounded-xl bg-gradient-to-br ${slide.accent} text-white transition-colors duration-700 sm:min-h-[370px]`}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className={`absolute -right-20 -top-24 h-72 w-72 rounded-full ${slide.decor} opacity-20 blur-2xl transition-colors duration-700`} />
          <div className="absolute -bottom-40 right-[18%] h-80 w-80 rounded-full border-[36px] border-white/10" />
          <div className="absolute bottom-8 right-[12%] hidden h-36 w-36 rotate-12 rounded-[2rem] border border-white/20 bg-white/[0.06] backdrop-blur-sm sm:block" />
          <div className="absolute right-[23%] top-12 hidden h-14 w-14 -rotate-12 rounded-2xl border border-white/20 bg-white/10 sm:block" />
        </div>

        <div
          key={currentSlide}
          className="relative z-10 flex w-full max-w-2xl flex-col justify-center px-6 py-10 motion-safe:animate-[fade-in_500ms_ease-out] sm:px-12"
        >
          <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold backdrop-blur">
            <Icon className="h-4 w-4 text-[#f3c56b]" />
            {slide.eyebrow}
          </span>
          <h1 className="max-w-xl text-3xl font-bold leading-tight sm:text-5xl">
            {slide.title}
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/85 sm:text-base sm:leading-7">
            {slide.description}
          </p>
          <Link
            href={slide.href}
            className="mt-7 inline-flex w-fit items-center gap-2 rounded-md bg-[#f3c56b] px-5 py-3 text-sm font-bold text-[#172b3a] transition hover:bg-[#ffd77d]"
          >
            {slide.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="absolute bottom-5 left-6 z-10 flex items-center gap-2 sm:left-12">
          {slides.map((item, index) => (
            <button
              key={item.eyebrow}
              type="button"
              onClick={() => setCurrentSlide(index)}
              aria-label={`عرض الشريحة ${index + 1}`}
              aria-current={index === currentSlide}
              className={`h-1.5 rounded-full transition-all ${
                index === currentSlide ? 'w-8 bg-[#f3c56b]' : 'w-3 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>

        <div className="absolute bottom-4 right-4 z-10 flex gap-2">
          <button
            type="button"
            onClick={goToPrevious}
            aria-label="الشريحة السابقة"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            aria-label="الشريحة التالية"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
