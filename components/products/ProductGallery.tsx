'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Zap } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  hasDiscount: boolean;
  discountPercentage: number;
}

export default function ProductGallery({ 
  images, 
  productName, 
  hasDiscount, 
  discountPercentage 
}: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="space-y-4">
      <div className="aspect-square bg-white rounded-2xl overflow-hidden relative group shadow-sm">
        <Image
          src={images[selectedImage]}
          alt={productName}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        
        {hasDiscount && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
            <Zap className="w-4 h-4 fill-current" />
            %{discountPercentage} İndirim
          </div>
        )}
      </div>
      
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedImage(index)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer relative shadow-sm active:scale-95 ${
                selectedImage === index 
                  ? 'border-[#1E3A5F] ring-2 ring-[#1E3A5F]/20' 
                  : 'border-transparent hover:border-[#1E3A5F]'
              }`}
            >
              <Image
                src={img}
                alt={`${productName} ${index + 1}`}
                fill
                className="object-cover"
                sizes="25vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}