import type { SupabaseClient } from '@supabase/supabase-js';

export type ReviewSummary = {
  averageRating: number;
  reviewCount: number;
};

export async function fetchReviewSummaries(
  supabase: SupabaseClient,
  productIds: string[]
): Promise<Record<string, ReviewSummary>> {
  const uniqueProductIds = [...new Set(productIds)];
  if (uniqueProductIds.length === 0) return {};

  const { data, error } = await supabase
    .from('reviews')
    .select('product_id, rating')
    .in('product_id', uniqueProductIds)
    .eq('is_approved', true);

  if (error) throw error;

  const totals = new Map<string, ReviewSummary>();
  for (const review of data) {
    const summary = totals.get(review.product_id) ?? {
      averageRating: 0,
      reviewCount: 0,
    };
    summary.averageRating += review.rating;
    summary.reviewCount += 1;
    totals.set(review.product_id, summary);
  }

  return Object.fromEntries(
    [...totals].map(([productId, summary]) => [
      productId,
      {
        averageRating: Math.round((summary.averageRating / summary.reviewCount) * 10) / 10,
        reviewCount: summary.reviewCount,
      },
    ])
  );
}
