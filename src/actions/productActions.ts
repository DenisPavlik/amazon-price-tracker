"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { productScraper } from "@/lib/productScraper";

export async function addProduct(productId: string) {
  const session = await auth();
  const user = session?.user;
  if (!user || !user.email) {
    return false;
  }

  const productRow = await prisma.product.create({
    data: {
      ...(await productScraper(productId)),
      userEmail: user.email,
    },
  });
  return productRow.id;
}
