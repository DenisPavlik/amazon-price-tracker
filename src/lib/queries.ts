import { prisma } from "@/lib/db";
import type { Product } from "@/lib/types";

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
      if (product.price === 0) return null;
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

export type ActivityKind = "PRICE_DROP" | "TARGET_HIT" | "PRICE_CHANGE";

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  at: Date;
  amazonId: string;
  title: string;
  img: string;
  priceFrom: number | null;
  priceTo: number;
};

export async function getRecentActivity(
  userEmail: string,
  limit = 5
): Promise<ActivityItem[]> {
  const products = await prisma.product.findMany({
    where: { userEmail },
    select: { amazonId: true, title: true, img: true },
  });
  if (products.length === 0) return [];
  const productByAsin = new Map(products.map((p) => [p.amazonId, p]));

  const notifications = await prisma.notification.findMany({
    where: { userEmail },
    orderBy: { createdAt: "desc" },
    take: limit * 2,
  });

  const notifItems: ActivityItem[] = notifications.map((n) => ({
    id: `notif:${n.id}`,
    kind: n.kind === "TARGET_HIT" ? "TARGET_HIT" : "PRICE_DROP",
    at: n.createdAt,
    amazonId: n.amazonId,
    title: n.title,
    img: productByAsin.get(n.amazonId)?.img ?? "",
    priceFrom: n.priceFrom,
    priceTo: n.priceTo ?? 0,
  }));

  const priceChangeItems: ActivityItem[] = [];
  await Promise.all(
    products.map(async (product) => {
      const lastTwo = await prisma.productDataHistory.findMany({
        where: { amazonId: product.amazonId },
        orderBy: { createdAt: "desc" },
        take: 2,
      });
      if (lastTwo.length < 2) return;
      const [latest, prev] = lastTwo;
      if (latest.price === prev.price) return;
      priceChangeItems.push({
        id: `hist:${latest.id}`,
        kind: "PRICE_CHANGE",
        at: latest.createdAt,
        amazonId: product.amazonId,
        title: product.title,
        img: product.img,
        priceFrom: prev.price,
        priceTo: latest.price,
      });
    })
  );

  const dayMs = 24 * 60 * 60 * 1000;
  const dedupedPriceChanges = priceChangeItems.filter(
    (pc) =>
      !notifItems.some(
        (n) =>
          n.amazonId === pc.amazonId &&
          Math.abs(n.at.getTime() - pc.at.getTime()) < dayMs
      )
  );

  return [...notifItems, ...dedupedPriceChanges]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, limit);
}
