// Bhutanese Ngultrum (Nu.) is pegged 1:1 with the Indian Rupee and isn't
// typically shown with decimals in everyday retail pricing.
export const SHIPPING_FEE = 150;

export function formatPrice(n) {
  return "Nu. " + Math.round(n).toLocaleString("en-US");
}
