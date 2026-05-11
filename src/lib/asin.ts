import { z } from "zod";

export const asinSchema = z
  .string()
  .trim()
  .regex(/^[A-Z0-9]{10}$/, "Invalid ASIN");

const ASIN_URL_RE = /\/(?:dp|gp\/product)\/([A-Z0-9]{10})/;

export function extractAsin(raw: string): string {
  const trimmed = raw.trim();
  try {
    const url = new URL(trimmed);
    const m = url.pathname.match(ASIN_URL_RE);
    if (m?.[1]) return m[1];
  } catch {
    // not a URL — fall through
  }
  return trimmed.toUpperCase();
}
