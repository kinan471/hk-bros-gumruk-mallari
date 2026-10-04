'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Zap } from 'lucide-react';

interface ProductGalleryProps {
  mainImage: string;
  galleryImages: string[];
  productName: string;
  hasDiscount: boolean;
  discountPercentage: number;
}

export default function ProductGallery({ 
  mainImage, 
  galleryImages, 
  productName, 
  hasDiscount, 
  discountPercentage 
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // دمج الصورة الرئيسية مع صور المعرض في مصفوفة واحدة
  const allImages = [mainImage, ...galleryImages];
  const currentImage = allImages[activeIndex];

  return (
    <div className="space-y-4">
      {/* الصورة الرئيسية */}
      <div className="aspect-square bg-white rounded-2xl overflow-hidden relative group shadow-sm">
        <Image
          src={currentImage}
          alt={`${productName} - Görsel ${activeIndex + 1}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          // تحميل فوري فقط للصورة الأولى، والباقي كسول
          priority={activeIndex === 0}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
          quality={85}
        />
        
        {hasDiscount && activeIndex === 0 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
            <Zap className="w-4 h-4 fill-current" />
            %{discountPercentage} İndirim
          </div>
        )}
      </div>
      
      {/* الصور المصغرة (Thumbnails) */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {allImages.map((img, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all cursor-pointer relative shadow-sm ${
                activeIndex === index 
                  ? 'border-[#1E3A5F] ring-2 ring-[#1E3A5F]/20' 
                  : 'border-transparent hover:border-[#1E3A5F]'
              }`}
              aria-label={`${productName} görsel ${index + 1}`}
            >
              <Image
                src={img}
                alt={`${productName} ${index + 1}`}
                fill
                className="object-cover"
                sizes="25vw"
                loading="lazy" // ✅ عدم تحميل الصور المصغرة إلا عند الحاجة لتسريع الصفحة
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}