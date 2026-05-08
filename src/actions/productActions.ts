"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { productScraper } from "@/lib/productScraper";
import { revalidatePath } from "next/cache";

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

export async function setTargetPrice(productId: number, cents: number) {
  const session = await auth();
  const user = session?.user;
  if (!user?.email) {
    return { ok: false as const, error: "unauthorized" };
  }

  if (!Number.isInteger(cents) || cents <= 0) {
    return { ok: false as const, error: "invalid_price" };
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, userEmail: user.email },
    select: { id: true, amazonId: true },
  });
  if (!product) {
    return { ok: false as const, error: "not_found" };
  }

  await prisma.product.update({
    where: { id: product.id },
    data: { targetPrice: cents },
  });

  revalidatePath("/");
  revalidatePath(`/product/${product.amazonId}`);
  return { ok: true as const };
}

export async function clearTargetPrice(productId: number) {
  const session = await auth();
  const user = session?.user;
  if (!user?.email) {
    return { ok: false as const, error: "unauthorized" };
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, userEmail: user.email },
    select: { id: true, amazonId: true },
  });
  if (!product) {
    return { ok: false as const, error: "not_found" };
  }

  await prisma.product.update({
    where: { id: product.id },
    data: { targetPrice: null },
  });

  revalidatePath("/");
  revalidatePath(`/product/${product.amazonId}`);
  return { ok: true as const };
}
