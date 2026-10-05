'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Zap, Shield } from 'lucide-react';

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
    <div className="space-y-4">
      {/* الصورة الرئيسية */}
      <div className="aspect-square bg-white rounded-2xl overflow-hidden relative group shadow-sm">
        <Image
          src={currentImage}
          alt={`${productName} - Görsel ${activeIndex + 1}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          preload={activeIndex === 0}
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
      
      {/* الصور المصغرة القابلة للنقر */}
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
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* حالة المنتج */}
      {productCondition && (
        <div className={`p-4 rounded-xl border ${getConditionStyle(productCondition)}`}>
          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#1E3A5F]" />
            Ürün Durumu
          </h4>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Bu ürün: </span>
            {getConditionIcon(productCondition)} {productCondition}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            * Gümrük malları doğası gereği ambalajında küçük değişiklikler olabilir, ancak ürün işlevselliği ve orijinalliği %100 garantilidir.
          </p>
        </div>
      )}
    </div>
  );
}