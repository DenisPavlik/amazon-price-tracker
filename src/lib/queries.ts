import { prisma } from "@/lib/db";
import type { Product } from "../../generated/prisma";

export type TopDrop = {
  product: Product;
  oldPrice: number;
  newPrice: number;
  dropPct: number;
};

export async function getTopDropsThisWeek(
  userEmail: string,
  limit = 3
): Promise<TopDrop[]> {
  const products = await prisma.product.findMany({ where: { userEmail } });
  if (products.length === 0) return [];

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const candidates = await Promise.all(
    products.map(async (product) => {
      const oldest = await prisma.productDataHistory.findFirst({
        where: { amazonId: product.amazonId, createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: "asc" },
      });
      if (!oldest || oldest.price <= product.price) return null;
      const dropPct = ((oldest.price - product.price) / oldest.price) * 100;
      return {
        product,
        oldPrice: oldest.price,
        newPrice: product.price,
        dropPct,
      } satisfies TopDrop;
    })
  );

  return candidates
    .filter((c): c is TopDrop => c !== null)
    .sort((a, b) => b.dropPct - a.dropPct)
    .slice(0, limit);
}

export async function getTotalSavingsAllTime(
  userEmail: string
): Promise<number> {
  const products = await prisma.product.findMany({
    where: { userEmail },
    select: { amazonId: true, price: true },
  });
  if (products.length === 0) return 0;

  const maxRows = await prisma.productDataHistory.groupBy({
    by: ["amazonId"],
    where: { amazonId: { in: products.map((p) => p.amazonId) } },
    _max: { price: true },
  });

  const maxByAsin = new Map(
    maxRows.map((row) => [row.amazonId, row._max.price ?? 0])
  );

  let total = 0;
  for (const product of products) {
    const max = maxByAsin.get(product.amazonId) ?? product.price;
    if (max > product.price) total += max - product.price;
  }
  return total;
}
