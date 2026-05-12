import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { productScraper, ScraperError } from "@/lib/productScraper";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("RAPIDAPI_KEY", "test-key");
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function jsonResponse(body: unknown, init: Partial<ResponseInit> = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

describe("productScraper", () => {
  it("maps a successful RapidAPI payload to the storage shape", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        status: "OK",
        data: {
          asin: "B0ABCDEFGH",
          product_title: "Sample",
          product_price: "$2,640.61",
          product_photo: "https://img/x.jpg",
          product_star_rating: "4.7",
          product_num_ratings: 1234,
        },
      })
    );

    const result = await productScraper("B0ABCDEFGH");

    expect(result).toEqual({
      title: "Sample",
      img: "https://img/x.jpg",
      price: 264061, // 2640.61 → cents
      reviewsCount: 1234,
      reviewsAverageRating: 47, // 4.7 × 10
      amazonId: "B0ABCDEFGH",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("asin=B0ABCDEFGH"),
      expect.objectContaining({
        headers: expect.objectContaining({
          "x-rapidapi-key": "test-key",
        }),
      })
    );
  });

  it("handles null price/photo/rating gracefully", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        status: "OK",
        data: {
          asin: "B0ABCDEFGH",
          product_title: "No price",
          product_price: null,
          product_photo: null,
          product_star_rating: null,
          product_num_ratings: null,
        },
      })
    );

    const result = await productScraper("B0ABCDEFGH");
    expect(result.price).toBe(0);
    expect(result.img).toBe("");
    expect(result.reviewsAverageRating).toBe(0);
    expect(result.reviewsCount).toBe(0);
  });

  it("throws ScraperError(quota_exceeded) on HTTP 429", async () => {
    fetchMock.mockResolvedValue(
      new Response("rate limited", { status: 429, statusText: "Too Many" })
    );

    await expect(productScraper("B0ABCDEFGH")).rejects.toMatchObject({
      name: "ScraperError",
      kind: "quota_exceeded",
      status: 429,
    });
  });

  it("throws ScraperError(fetch_failed) on other non-OK HTTP", async () => {
    fetchMock.mockResolvedValue(
      new Response("server error", { status: 500, statusText: "Internal" })
    );

    const err = await productScraper("B0ABCDEFGH").catch((e) => e);
    expect(err).toBeInstanceOf(ScraperError);
    expect(err.kind).toBe("fetch_failed");
    expect(err.status).toBe(500);
  });

  it("throws ScraperError(fetch_failed) when JSON has non-OK status", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ status: "ERROR", data: null })
    );

    const err = await productScraper("B0ABCDEFGH").catch((e) => e);
    expect(err).toBeInstanceOf(ScraperError);
    expect(err.kind).toBe("fetch_failed");
  });

  it("throws ScraperError(fetch_failed) on non-JSON payload", async () => {
    fetchMock.mockResolvedValue(
      new Response("<html>not json</html>", {
        status: 200,
        headers: { "Content-Type": "text/html" },
      })
    );

    const err = await productScraper("B0ABCDEFGH").catch((e) => e);
    expect(err).toBeInstanceOf(ScraperError);
    expect(err.kind).toBe("fetch_failed");
  });
});
