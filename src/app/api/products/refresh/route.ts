import { prisma } from "@/lib/db";
import { productScraper } from "@/lib/productScraper";
import { isToday } from "date-fns";

export async function GET() {
  const products = await prisma.product.findMany();
  for (const product of products) {
    const latestHistoryDbData = await prisma.productDataHistory.findFirst({
      where: {
        amazonId: product.amazonId,
      },
    });
    if (latestHistoryDbData && isToday(latestHistoryDbData.createdAt)) {
      continue;
    }
    const newProductData = await productScraper(product.amazonId);
    await prisma.productDataHistory.create({
      data: newProductData,
    });
  }

  return Response.json("ok");
}
