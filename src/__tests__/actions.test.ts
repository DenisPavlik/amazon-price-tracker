import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/auth", () => ({ auth: vi.fn() }));

vi.mock("@/lib/db", () => ({
  prisma: {
    product: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    productDataHistory: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    notification: {
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/productScraper", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/productScraper")>(
      "@/lib/productScraper"
    );
  return {
    ...actual,
    productScraper: vi.fn(),
  };
});

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { productScraper, ScraperError } from "@/lib/productScraper";
import {
  addProduct,
  setTargetPrice,
} from "@/actions/productActions";
import { markRead } from "@/actions/notificationActions";

const mockedAuth = auth as unknown as ReturnType<typeof vi.fn>;
const mockedScraper = productScraper as unknown as ReturnType<typeof vi.fn>;
type PrismaMock = {
  product: {
    findFirst: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  productDataHistory: {
    create: ReturnType<typeof vi.fn>;
    deleteMany: ReturnType<typeof vi.fn>;
  };
  notification: {
    updateMany: ReturnType<typeof vi.fn>;
    deleteMany: ReturnType<typeof vi.fn>;
  };
};
const db = prisma as unknown as PrismaMock;

const VALID_ASIN = "B0ABCDEFGH";

beforeEach(() => {
  vi.clearAllMocks();
});

function signedIn() {
  mockedAuth.mockResolvedValue({ user: { email: "user@example.com" } });
}
function signedOut() {
  mockedAuth.mockResolvedValue(null);
}

describe("addProduct", () => {
  it("rejects unauthenticated callers", async () => {
    signedOut();
    const result = await addProduct(VALID_ASIN);
    expect(result).toEqual({ ok: false, error: "unauthorized" });
  });

  it("rejects invalid ASIN format", async () => {
    signedIn();
    const result = await addProduct("not-an-asin");
    expect(result).toEqual({ ok: false, error: "invalid_asin" });
    expect(mockedScraper).not.toHaveBeenCalled();
  });

  it("returns duplicate when product already exists for user", async () => {
    signedIn();
    db.product.findFirst.mockResolvedValue({ id: 7 });
    const result = await addProduct(VALID_ASIN);
    expect(result).toEqual({ ok: false, error: "duplicate" });
    expect(mockedScraper).not.toHaveBeenCalled();
  });

  it("returns quota_exceeded when scraper hits the RapidAPI limit", async () => {
    signedIn();
    db.product.findFirst.mockResolvedValue(null);
    mockedScraper.mockRejectedValue(
      new ScraperError("quota_exceeded", "boom", 429)
    );
    const result = await addProduct(VALID_ASIN);
    expect(result).toEqual({ ok: false, error: "quota_exceeded" });
  });

  it("creates product + history snapshot on success", async () => {
    signedIn();
    db.product.findFirst.mockResolvedValue(null);
    mockedScraper.mockResolvedValue({
      title: "T",
      img: "i.png",
      price: 1999,
      reviewsCount: 10,
      reviewsAverageRating: 47,
      amazonId: VALID_ASIN,
    });
    db.product.create.mockResolvedValue({ id: 1 });
    db.productDataHistory.create.mockResolvedValue({ id: 1 });

    const result = await addProduct(VALID_ASIN);
    expect(result).toEqual({ ok: true, data: { asin: VALID_ASIN } });
    expect(db.product.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        amazonId: VALID_ASIN,
        userEmail: "user@example.com",
        price: 1999,
      }),
    });
    expect(db.productDataHistory.create).toHaveBeenCalled();
  });
});

describe("setTargetPrice", () => {
  it("rejects unauthenticated callers", async () => {
    signedOut();
    expect(await setTargetPrice(1, 100)).toEqual({
      ok: false,
      error: "unauthorized",
    });
  });

  it("rejects non-positive or non-integer cents", async () => {
    signedIn();
    expect(await setTargetPrice(1, 0)).toEqual({
      ok: false,
      error: "invalid_price",
    });
    expect(await setTargetPrice(1, -5)).toEqual({
      ok: false,
      error: "invalid_price",
    });
    expect(await setTargetPrice(1, 1.5)).toEqual({
      ok: false,
      error: "invalid_price",
    });
  });

  it("returns not_found if product is not owned by user", async () => {
    signedIn();
    db.product.findFirst.mockResolvedValue(null);
    expect(await setTargetPrice(42, 999)).toEqual({
      ok: false,
      error: "not_found",
    });
    expect(db.product.update).not.toHaveBeenCalled();
  });

  it("updates targetPrice and scopes lookup by userEmail", async () => {
    signedIn();
    db.product.findFirst.mockResolvedValue({ id: 42, amazonId: "B0ABCDEFGH" });
    db.product.update.mockResolvedValue({ id: 42 });
    const result = await setTargetPrice(42, 999);
    expect(result).toEqual({ ok: true });
    expect(db.product.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 42, userEmail: "user@example.com" },
      })
    );
    expect(db.product.update).toHaveBeenCalledWith({
      where: { id: 42 },
      data: { targetPrice: 999 },
    });
  });
});

describe("markRead", () => {
  it("returns false for unauthenticated callers", async () => {
    signedOut();
    expect(await markRead(1)).toBe(false);
  });

  it("scopes updateMany by userEmail", async () => {
    signedIn();
    db.notification.updateMany.mockResolvedValue({ count: 1 });
    const result = await markRead(5);
    expect(result).toBe(true);
    expect(db.notification.updateMany).toHaveBeenCalledWith({
      where: { id: 5, userEmail: "user@example.com" },
      data: { isRead: true },
    });
  });

  it("returns false when no matching notification exists", async () => {
    signedIn();
    db.notification.updateMany.mockResolvedValue({ count: 0 });
    expect(await markRead(5)).toBe(false);
  });
});
