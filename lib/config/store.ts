const STORE_PHONE_DIGITS = '905314319921';

export const STORE_CONTACT = {
  phoneDisplay: `+${STORE_PHONE_DIGITS.slice(0, 2)} ${STORE_PHONE_DIGITS.slice(2, 5)} ${STORE_PHONE_DIGITS.slice(5, 8)} ${STORE_PHONE_DIGITS.slice(8, 10)} ${STORE_PHONE_DIGITS.slice(10)}`,
  phoneE164: `+${STORE_PHONE_DIGITS}`,
  whatsappNumber: STORE_PHONE_DIGITS,
  email: 'info@hkbros.com',
  location: 'İstanbul, Türkiye',
} as const;

export const STORE_BUSINESS_HOURS = [
  { day: 'Pazartesi - Cuma', hours: '09:00 - 20:00' },
  { day: 'Cumartesi', hours: '10:00 - 18:00' },
  { day: 'Pazar', hours: 'Kapalı' },
] as const;

export const STORE_SHIPPING = {
  freeShippingMinimum: 1000,
  standardShippingFee: 50,
  dispatchTime: '1 iş günü',
  estimatedDelivery: '2-4 iş günü',
} as const;

export const STORE_RETURN_WINDOW_DAYS = 3;

export function calculateShippingCost(subtotal: number): number {
  return subtotal >= STORE_SHIPPING.freeShippingMinimum
    ? 0
    : STORE_SHIPPING.standardShippingFee;
}
