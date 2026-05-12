import { describe, it, expect } from "vitest";
import { formatPrice, hasPrice, PRICE_UNAVAILABLE } from "@/lib/price";
import { parseLocalizedNumber } from "@/lib/productScraper";

describe("hasPrice", () => {
  it("returns false for null/undefined", () => {
    expect(hasPrice(null)).toBe(false);
    expect(hasPrice(undefined)).toBe(false);
  });
  it("returns false for 0 or negative", () => {
    expect(hasPrice(0)).toBe(false);
    expect(hasPrice(-100)).toBe(false);
  });
  it("returns true for positive integers", () => {
    expect(hasPrice(1)).toBe(true);
    expect(hasPrice(2999)).toBe(true);
  });
});

describe("formatPrice", () => {
  it("formats cents → $X.XX", () => {
    expect(formatPrice(2999)).toBe("$29.99");
    expect(formatPrice(100)).toBe("$1.00");
    expect(formatPrice(1)).toBe("$0.01");
  });
  it("handles large numbers", () => {
    expect(formatPrice(123456789)).toBe("$1234567.89");
  });
  it("returns placeholder for unavailable price", () => {
    expect(formatPrice(0)).toBe(PRICE_UNAVAILABLE);
    expect(formatPrice(null)).toBe(PRICE_UNAVAILABLE);
    expect(formatPrice(undefined)).toBe(PRICE_UNAVAILABLE);
  });
});

describe("parseLocalizedNumber", () => {
  it("parses US-formatted strings with commas", () => {
    expect(parseLocalizedNumber("1,234.56")).toBe(1234.56);
    expect(parseLocalizedNumber("2,640.61")).toBe(2640.61);
  });
  it("parses simple decimals", () => {
    expect(parseLocalizedNumber("29.99")).toBe(29.99);
  });
  it("strips currency symbols", () => {
    expect(parseLocalizedNumber("$1,299.00")).toBe(1299);
  });
  it("returns 0 for falsy/garbage input", () => {
    expect(parseLocalizedNumber(null)).toBe(0);
    expect(parseLocalizedNumber(undefined)).toBe(0);
    expect(parseLocalizedNumber("")).toBe(0);
    expect(parseLocalizedNumber("abc")).toBe(0);
  });
});
