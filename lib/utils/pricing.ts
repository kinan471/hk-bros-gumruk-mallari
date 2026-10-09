export function isDiscountedPrice(
  regularPrice: number | null | undefined,
  salePrice: number | null | undefined
): boolean {
  return (
    typeof regularPrice === 'number' &&
    Number.isFinite(regularPrice) &&
    regularPrice >= 0 &&
    typeof salePrice === 'number' &&
    Number.isFinite(salePrice) &&
    salePrice >= 0 &&
    salePrice < regularPrice
  );
}

export function getCurrentProductPrice(
  regularPrice: number | null | undefined,
  salePrice: number | null | undefined
): number | null {
  if (typeof regularPrice !== 'number' || !Number.isFinite(regularPrice) || regularPrice < 0) {
    return null;
  }
  return isDiscountedPrice(regularPrice, salePrice) && typeof salePrice === 'number'
    ? salePrice
    : regularPrice;
}
