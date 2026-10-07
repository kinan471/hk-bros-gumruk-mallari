'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Shield } from 'lucide-react';

interface ProductGalleryProps {
  mainImage: string;
  galleryImages: string[];
  productName: string;
  hasDiscount: boolean;
  discountPercentage: number;
  productCondition?: string;
}

export default function ProductGallery({ 
  mainImage, 
  galleryImages, 
  productName, 
  hasDiscount, 
  discountPercentage,
  productCondition
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // دمج الصورة الرئيسية مع صور المعرض
  const allImages = [mainImage, ...galleryImages];
  const currentImage = allImages[activeIndex];

  // تحديد لون شارة الحالة
  const getConditionStyle = (condition: string) => {
    if (condition.includes('Sıfır')) return 'bg-green-50 border-green-200';
    if (condition.includes('Kutu Açılmış')) return 'bg-yellow-50 border-yellow-200';
    if (condition.includes('Teşhir')) return 'bg-orange-50 border-orange-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getConditionIcon = (condition: string) => {
    if (condition.includes('Sıfır')) return '';
    if (condition.includes('Kutu Açılmış')) return '🟡';
    if (condition.includes('Teşhir')) return '🟠';
    return '🟤';
  };

  return (
    <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-gray-200/80 bg-[#f6f5f1] shadow-sm sm:aspect-square sm:rounded-3xl">
        <Image
          src={currentImage}
          alt={`${productName} - Görsel ${activeIndex + 1}`}
          fill
          className="object-contain p-3 transition-transform duration-500 sm:p-8"
          preload={activeIndex === 0}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
          quality={85}
        />
        
        {hasDiscount && activeIndex === 0 && (
          <div className="absolute -left-8 top-4 flex w-32 -rotate-45 items-center justify-center gap-1.5 bg-[#8c332b] py-1 text-[10px] font-semibold text-white shadow-sm sm:left-4 sm:top-4 sm:w-auto sm:rotate-0 sm:rounded-full sm:px-3 sm:py-1.5 sm:text-xs">
            %{discountPercentage} İndirim
          </div>
        )}
      </div>
      
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {allImages.map((img, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-pressed={activeIndex === index}
              className={`relative aspect-square w-[58px] shrink-0 overflow-hidden rounded-lg border transition-all sm:w-[82px] sm:rounded-xl ${
                activeIndex === index 
                  ? 'border-[#1E3A5F] ring-2 ring-[#1E3A5F]/15'
                  : 'border-gray-200 bg-[#f6f5f1] hover:border-gray-400'
              }`}
              aria-label={`${productName} görsel ${index + 1}`}
            >
              <Image
                src={img}
                alt={`${productName} ${index + 1}`}
                fill
                className="object-contain p-2"
                sizes="82px"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* حالة المنتج */}
      {productCondition && (
        <div className={`rounded-xl border p-3 sm:rounded-2xl sm:p-5 ${getConditionStyle(productCondition)}`}>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-950">
            <Shield className="h-4 w-4 text-[#1E3A5F]" />
            Ürün kondisyonu
          </h4>
          <p className="text-sm font-medium text-gray-700">{getConditionIcon(productCondition)} {productCondition}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
            Ürün durumuyla ilgili detayları sipariş öncesinde WhatsApp üzerinden satıcıya sorabilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
}