import { prisma } from "@/lib/db";
import { productScraper } from "@/lib/productScraper";
import { endOfDay, isToday, startOfDay, subDays } from "date-fns";

function shorten(title: string, max = 60) {
  return title.length > max ? title.slice(0, max) + "..." : title;
}

export async function GET() {
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
          type: "PRICE_DROP",
          title: `The price of ${shortTitle} dropped from $${(
            prevDayData.price / 100
          ).toFixed(2)} to $${(newProductData.price / 100).toFixed(2)}`,
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
          type: "TARGET_HIT",
          title: `Target hit: ${shortTitle} is now $${(
            newProductData.price / 100
          ).toFixed(2)} (target $${(product.targetPrice! / 100).toFixed(2)})`,
        },
      });
    }
  }

  return Response.json("ok");
}
