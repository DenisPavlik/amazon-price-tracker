import { prisma } from "@/lib/db";
import { productScraper } from "@/lib/productScraper";
import { endOfDay, isToday, startOfDay, subDays } from "date-fns";

export async function GET() {
  const products = await prisma.product.findMany();
  for (const product of products) {
    const latestHistoryDbData = await prisma.productDataHistory.findFirst({
      where: {
        amazonId: product.amazonId,
      },
      orderBy: { createdAt: "desc" },
    });
    if (latestHistoryDbData && isToday(latestHistoryDbData.createdAt)) {
      continue;
    }
    const newProductData = await productScraper(product.amazonId);
    await prisma.productDataHistory.create({
      data: newProductData,
    });

    await prisma.product.update({
      where: { id: product.id },
      data: {
        price: newProductData.price,
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

    if (prevDayData && prevDayData.price > newProductData.price) {
      const shortTitle =
        product.title.length > 60
          ? product.title.slice(0, 60) + "..."
          : product.title;
      await prisma.notification.create({
        data: {
          userEmail: product.userEmail,
          amazonId: product.amazonId,
          title: `The prise of ${shortTitle} was decreased from ${
            prevDayData.price / 100
          }USD to ${newProductData.price / 100}USD`,
        },
      });
    }
  }

  return Response.json("ok");
}
