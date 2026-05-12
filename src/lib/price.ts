export const PRICE_UNAVAILABLE = "Price unavailable";

export function hasPrice(cents: number | null | undefined): cents is number {
  return typeof cents === "number" && cents > 0;
}

export function formatPrice(cents: number | null | undefined): string {
  if (!hasPrice(cents)) return PRICE_UNAVAILABLE;
  return `$${(cents / 100).toFixed(2)}`;
}
