export class ScraperError extends Error {
  constructor(
    public kind: "quota_exceeded" | "fetch_failed",
    message: string,
    public status?: number,
    public body?: string
  ) {
    super(message);
    this.name = "ScraperError";
  }
}

function truncate(s: string, max = 300) {
  return s.length > max ? s.slice(0, max) + "…" : s;
}

/**
 * RapidAPI returns prices as US-formatted strings like "2,640.61" or "$2,640.61".
 * `parseFloat` stops at the first comma → strip non-numeric characters first.
 */
export function parseLocalizedNumber(raw: string | null | undefined): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

type ProductDetailsResponse = {
  status: string;
  data?: {
    asin: string;
    product_title: string;
    product_price: string | null;
    product_photo: string | null;
    product_star_rating: string | null;
    product_num_ratings: number | null;
  };
};

export async function productScraper(productId: string) {
  const response = await fetch(
    `https://real-time-amazon-data.p.rapidapi.com/product-details?asin=${productId}&country=US`,
    {
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": "real-time-amazon-data.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPIDAPI_KEY ?? "",
      },
    }
  );

  if (!response.ok) {
    const body = truncate(await response.text().catch(() => ""));
    if (response.status === 429) {
      throw new ScraperError(
        "quota_exceeded",
        `RapidAPI rate limit / quota (status ${response.status}): ${body}`,
        response.status,
        body
      );
    }
    throw new ScraperError(
      "fetch_failed",
      `RapidAPI responded ${response.status} ${response.statusText}: ${body}`,
      response.status,
      body
    );
  }

  const rawText = await response.text();
  let json: ProductDetailsResponse;
  try {
    json = JSON.parse(rawText) as ProductDetailsResponse;
  } catch {
    throw new ScraperError(
      "fetch_failed",
      `RapidAPI returned non-JSON payload: ${truncate(rawText)}`,
      response.status,
      truncate(rawText)
    );
  }
  if (json.status !== "OK" || !json.data) {
    throw new ScraperError(
      "fetch_failed",
      `RapidAPI returned non-OK payload (status=${json.status}): ${truncate(rawText)}`,
      response.status,
      truncate(rawText)
    );
  }

  const product = json.data;
  const priceNum = parseLocalizedNumber(product.product_price);
  const ratingNum = parseLocalizedNumber(product.product_star_rating);

  // price → cents (Int); rating → star × 10 (Int). See prisma/schema.prisma.
  return {
    title: product.product_title,
    img: product.product_photo ?? "",
    price: Math.round(priceNum * 100),
    reviewsCount: product.product_num_ratings ?? 0,
    reviewsAverageRating: Math.round(ratingNum * 10),
    amazonId: productId,
  };
}
