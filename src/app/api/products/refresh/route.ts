import { prisma } from "@/lib/db";
import { productScraper } from "@/lib/productScraper";
import { endOfDay, isToday, startOfDay, subDays } from "date-fns";
import type { NextRequest } from "next/server";

function shorten(title: string, max = 60) {
  return title.length > max ? title.slice(0, max) + "..." : title;
}

export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return new Response("Server misconfigured", { status: 500 });
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${expected}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const products = await prisma.product.findMany();
  for (const product of products) {
    const latestHistoryDbData = await prisma.productDataHistory.findFirst({
      where: { amazonId: product.amazonId },
      orderBy: { createdAt: "desc" },
    });
    if (latestHistoryDbData && isToday(latestHistoryDbData.createdAt)) {
      continue;
    }

    const newProductData = await productScraper(product.amazonId);
    await prisma.productDataHistory.create({ data: newProductData });

    const newLowest =
      product.lowestPrice == null
        ? newProductData.price
        : Math.min(product.lowestPrice, newProductData.price);

    await prisma.product.update({
      where: { id: product.id },
      data: {
        price: newProductData.price,
        lowestPrice: newLowest,
        updatedAt: new Date(),
      },
    });

    const prevDayData = await prisma.productDataHistory.findFirst({
      where: {
        amazonId: product.amazonId,
        createdAt: {
          gt: startOfDay(subDays(new Date(), 1)),
          lt: endOfDay(subDays(new Date(), 1)),
        },
      },
    });

    const shortTitle = shorten(product.title);

    if (prevDayData && prevDayData.price > newProductData.price) {
      await prisma.notification.create({
        data: {
          userEmail: product.userEmail,
          amazonId: product.amazonId,
          productId: product.id,
          kind: "PRICE_DROP",
          priceFrom: prevDayData.price,
          priceTo: newProductData.price,
          title: shortTitle,
        },
      });
    }

    const crossedTarget =
      product.targetPrice != null &&
      product.price > product.targetPrice &&
      newProductData.price <= product.targetPrice;

    if (crossedTarget) {
      await prisma.notification.create({
        data: {
          userEmail: product.userEmail,
          amazonId: product.amazonId,
          productId: product.id,
          kind: "TARGET_HIT",
          priceFrom: product.targetPrice!,
          priceTo: newProductData.price,
          title: shortTitle,
        },
      });
    }
  }

  return Response.json("ok");
}
