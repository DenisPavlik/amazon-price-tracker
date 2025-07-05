import { prisma } from "@/lib/db";
import { productScraper } from "@/lib/productScraper";

export async function GET() {
  const products = await prisma.product.findMany();
  for(const product of products) {
    const newProductData = await productScraper(product.amazonId)
  }
}