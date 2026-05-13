import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    product: { findMany: vi.fn() },
    productDataHistory: { findFirst: vi.fn(), groupBy: vi.fn(), findMany: vi.fn() },
    notification: { findMany: vi.fn() },
  },
}));

import { prisma } from "@/lib/db";
import { getTopDropsThisWeek, getTotalSavingsAllTime } from "@/lib/queries";

type Mocked = {
  product: { findMany: ReturnType<typeof vi.fn> };
  productDataHistory: {
    findFirst: ReturnType<typeof vi.fn>;
    groupBy: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
  };
  notification: { findMany: ReturnType<typeof vi.fn> };
};
const mocked = prisma as unknown as Mocked;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getTopDropsThisWeek", () => {
  it("returns [] when user has no products", async () => {
    mocked.product.findMany.mockResolvedValue([]);
    expect(await getTopDropsThisWeek("a@b.com")).toEqual([]);
  });

  it("returns [] when no history rows in the last 7 days", async () => {
    mocked.product.findMany.mockResolvedValue([
      { id: 1, amazonId: "A1", price: 1000 },
    ]);
    mocked.productDataHistory.findFirst.mockResolvedValue(null);
    expect(await getTopDropsThisWeek("a@b.com")).toEqual([]);
  });

  it("skips products whose current price is 0", async () => {
    mocked.product.findMany.mockResolvedValue([
      { id: 1, amazonId: "A1", price: 0 },
    ]);
    expect(await getTopDropsThisWeek("a@b.com")).toEqual([]);
    expect(mocked.productDataHistory.findFirst).not.toHaveBeenCalled();
  });

  it("orders by drop% desc and respects limit", async () => {
    const products = [
      { id: 1, amazonId: "A1", price: 800 }, // from 1000 → 20%
      { id: 2, amazonId: "A2", price: 500 }, // from 1000 → 50%
      { id: 3, amazonId: "A3", price: 900 }, // from 1000 → 10%
    ];
    mocked.product.findMany.mockResolvedValue(products);
    mocked.productDataHistory.findFirst.mockImplementation(
      ({ where }: { where: { amazonId: string } }) => {
        return Promise.resolve({ price: 1000, amazonId: where.amazonId });
      }
    );
    const result = await getTopDropsThisWeek("a@b.com", 2);
    expect(result).toHaveLength(2);
    expect(result[0].product.amazonId).toBe("A2");
    expect(result[1].product.amazonId).toBe("A1");
    expect(result[0].dropPct).toBeCloseTo(50);
  });

  it("ignores products where old price <= current price", async () => {
    mocked.product.findMany.mockResolvedValue([
      { id: 1, amazonId: "A1", price: 1500 },
    ]);
    mocked.productDataHistory.findFirst.mockResolvedValue({ price: 1000 });
    expect(await getTopDropsThisWeek("a@b.com")).toEqual([]);
  });
});

describe("getTotalSavingsAllTime", () => {
  it("returns 0 when no products", async () => {
    mocked.product.findMany.mockResolvedValue([]);
    expect(await getTotalSavingsAllTime("a@b.com")).toBe(0);
  });

  it("sums (listPrice - current) for products where listPrice > current", async () => {
    mocked.product.findMany.mockResolvedValue([
      { amazonId: "A1", price: 500, listPrice: 1000 }, // saves 500
      { amazonId: "A2", price: 1000, listPrice: 1000 }, // saves 0
      { amazonId: "A3", price: 700, listPrice: 900 }, // saves 200
    ]);
    expect(await getTotalSavingsAllTime("a@b.com")).toBe(700);
    expect(mocked.productDataHistory.findFirst).not.toHaveBeenCalled();
  });

  it("does not count savings when current price >= listPrice", async () => {
    mocked.product.findMany.mockResolvedValue([
      { amazonId: "A1", price: 600, listPrice: 500 }, // current > list → 0
    ]);
    expect(await getTotalSavingsAllTime("a@b.com")).toBe(0);
  });

  it("falls back to initial history price when listPrice is null", async () => {
    mocked.product.findMany.mockResolvedValue([
      { amazonId: "A1", price: 500, listPrice: null },
    ]);
    mocked.productDataHistory.findFirst.mockResolvedValue({
      amazonId: "A1",
      price: 1000,
    });
    expect(await getTotalSavingsAllTime("a@b.com")).toBe(500);
  });

  it("returns 0 when listPrice is null and no history row exists", async () => {
    mocked.product.findMany.mockResolvedValue([
      { amazonId: "A1", price: 500, listPrice: null },
    ]);
    mocked.productDataHistory.findFirst.mockResolvedValue(null);
    expect(await getTotalSavingsAllTime("a@b.com")).toBe(0);
  });

  it("only queries history for products missing listPrice", async () => {
    mocked.product.findMany.mockResolvedValue([
      { amazonId: "A1", price: 500, listPrice: 1000 }, // saves 500, no history lookup
      { amazonId: "A2", price: 400, listPrice: null }, // history lookup needed
    ]);
    mocked.productDataHistory.findFirst.mockResolvedValue({
      amazonId: "A2",
      price: 600,
    });
    expect(await getTotalSavingsAllTime("a@b.com")).toBe(500 + 200);
    expect(mocked.productDataHistory.findFirst).toHaveBeenCalledTimes(1);
  });
});
