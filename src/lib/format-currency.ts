/**
 * Formats monetary amounts stored in integer minor units (cents/piastres) into EGP string.
 * e.g. 159900 cents -> "EGP 1,599" or "١٬٥٩٩ ج.م"
 */
export function formatPrice(
  cents: number,
  locale: string = 'en',
  options: { includeCurrency?: boolean } = { includeCurrency: true }
): string {
  const amount = cents / 100;
  const isArabic = locale === 'ar';

  const formatter = new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-EG', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  });

  const formattedNumber = formatter.format(amount);

  if (!options.includeCurrency) {
    return formattedNumber;
  }

  return isArabic ? `${formattedNumber} ج.م` : `EGP ${formattedNumber}`;
}
