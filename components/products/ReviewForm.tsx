'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Star, Send, CheckCircle } from 'lucide-react';

interface ReviewFormProps {
  productId: string;
  onSuccess: () => void;
}

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const supabase = createClient();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [userName, setUserName] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Lütfen bir puan seçin');
      return;
    }
    if (!userName.trim()) {
      setError('Lütfen adınızı girin');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .insert([
          {
            product_id: productId,
            user_name: userName.trim(),
            rating,
            comment: comment.trim() || null,
            is_approved: true,
          },
        ]);

      if (error) throw error;

      setIsSuccess(true);
      setRating(0);
      setUserName('');
      setComment('');
      
      setTimeout(() => {
        setIsSuccess(false);
        onSuccess();
      }, 2000);
    } catch (error: unknown) {
      console.error('Review error:', error);
      setError('Yorum gönderilirken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Star className="w-5 h-5 text-[#E8B04B] fill-current" />
        Değerlendirme Yap
      </h3>

      {isSuccess ? (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">Teşekkürler!</p>
            <p className="text-sm text-green-700">Değerlendirmeniz başarıyla kaydedildi.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Puanınız *
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110 active:scale-95"
                  aria-label={`${star} yıldız`}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'text-[#E8B04B] fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {(hoveredRating || rating) > 0 && (
                <span className="ml-3 text-sm font-medium text-gray-600">
                  {rating === 1 && 'Çok Kötü'}
                  {rating === 2 && 'Kötü'}
                  {rating === 3 && 'Orta'}
                  {rating === 4 && 'İyi'}
                  {rating === 5 && 'Mükemmel'}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adınız *
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent outline-none transition-all"
              placeholder="Adınızı girin"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yorumunuz (İsteğe Bağlı)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent outline-none transition-all resize-none"
              placeholder="Ürün hakkında düşüncelerinizi paylaşın..."
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {comment.length}/1000
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="w-full flex items-center justify-center gap-2 bg-[#1E3A5F] text-white py-3 rounded-xl font-semibold hover:bg-[#1A3354] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Değerlendirmeyi Gönder</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}