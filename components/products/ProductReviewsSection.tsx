'use client';

import { useState } from 'react';
import ReviewForm from './ReviewForm';
import ReviewsList from './ReviewsList';

interface ProductReviewsSectionProps {
  productId: string;
}

export default function ProductReviewsSection({ productId }: ProductReviewsSectionProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleReviewSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <ReviewForm productId={productId} onSuccess={handleReviewSuccess} />
      </div>
      <div className="lg:col-span-2">
        <ReviewsList key={refreshKey} productId={productId} />
      </div>
    </div>
  );
}