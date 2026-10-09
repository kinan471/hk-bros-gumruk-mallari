'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Star, MessageSquare, ThumbsUp, Calendar } from 'lucide-react';

export interface Review {
  id: string;
  product_id: string;
  user_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface ReviewsListProps {
  productId: string;
  initialReviews: Review[];
  refreshKey: number;
}

export default function ReviewsList({ productId, initialReviews, refreshKey }: ReviewsListProps) {
  const [supabase] = useState(() => createClient());
  const [reviews, setReviews] = useState(initialReviews);

  useEffect(() => {
    if (refreshKey === 0) return;

    let isCurrent = true;
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
        .from('reviews')
        .select('id, product_id, user_name, rating, comment, created_at')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

        if (error) throw error;
        if (isCurrent) setReviews(data ?? []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    void fetchReviews();
    return () => {
      isCurrent = false;
    };
  }, [productId, refreshKey, supabase]);

  const { averageRating, totalReviews, ratingDistribution } = useMemo(() => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const ratingTotal = reviews.reduce((sum, review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating as keyof typeof distribution] += 1;
        return sum + review.rating;
      }
      return sum;
    }, 0);

    return {
      averageRating: reviews.length
        ? Math.round((ratingTotal / reviews.length) * 10) / 10
        : 0,
      totalReviews: reviews.length,
      ratingDistribution: distribution,
    };
  }, [reviews]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRatingLabel = (rating: number) => {
    const labels = { 1: 'Çok Kötü', 2: 'Kötü', 3: 'Orta', 4: 'İyi', 5: 'Mükemmel' };
    return labels[rating as keyof typeof labels] || '';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-[#1E3A5F]" />
        Müşteri Yorumları ({totalReviews})
      </h3>

      {totalReviews === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Henüz yorum yapılmamış</p>
          <p className="text-sm text-gray-400 mt-1">İlk yorumu siz yapın!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-6 border-b border-gray-100">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className="text-5xl font-bold text-gray-900">{averageRating}</span>
                <div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(averageRating)
                            ? 'text-[#E8B04B] fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{totalReviews} değerlendirme</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = ratingDistribution[rating as keyof typeof ratingDistribution];
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 w-12">{rating} yıldız</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#E8B04B] to-[#F5C06B] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            {reviews.map(review => (
              <div
                key={review.id}
                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#1E3A5F] to-[#4A90A4] rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {review.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{review.user_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= review.rating
                                  ? 'text-[#E8B04B] fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {getRatingLabel(review.rating)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {formatDate(review.created_at)}
                  </div>
                </div>

                {review.comment && (
                  <p className="text-sm text-gray-700 leading-relaxed mt-3 pl-12">
                    {review.comment}
                  </p>
                )}

                <div className="flex items-center gap-4 mt-3 pl-12">
                  <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#1E3A5F] transition-colors">
                    <ThumbsUp className="w-3 h-3" />
                    Faydalı
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}