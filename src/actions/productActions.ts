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

  const productData = await productScraper(productId)

  await prisma.product.create({
    data: {
      ...productData,
      userEmail: user.email,
    },
  });

  await prisma.productDataHistory.create({
    data: {
      amazonId: productId,
      title: productData.title,
      img: productData.img,
      price: productData.price,
      reviewsCount: productData.reviewsCount,
      reviewsAverageRating: productData.reviewsAverageRating
    }
  })
  return true;
}

export async function deleteProduct(id: number) {
  const session = await auth();
  const user = session?.user;
  if (!user || !user.email) {
    return false;
  }

  const productDoc = await prisma.product.findFirst({
    where: {
      id: id,
      userEmail: user.email,
    },
  });

  if (!productDoc) {
    return false;
  }

  const productAmazonId = productDoc?.amazonId;

  await prisma.product.delete({
    where: {
      id: id,
    },
  });

  await prisma.productDataHistory.deleteMany({
    where: {
      amazonId: productAmazonId,
    },
  });

  return true;
}
