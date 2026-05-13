"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { productScraper, ScraperError } from "@/lib/productScraper";
import { asinSchema } from "@/lib/asin";
import { revalidatePath } from "next/cache";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export type ProductPreview = {
  asin: string;
  title: string;
  img: string;
  price: number;
  reviewsCount: number;
  reviewsAverageRating: number;
};

export async function getProductPreview(
  rawAsin: string
): Promise<ActionResult<ProductPreview>> {
  const session = await auth();
  if (!session?.user?.email) {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = asinSchema.safeParse(rawAsin);
  if (!parsed.success) {
    return { ok: false, error: "invalid_asin" };
  }
  const asin = parsed.data;

  try {
    const data = await productScraper(asin);
    return {
      ok: true,
      data: {
        asin,
        title: data.title,
        img: data.img,
        price: data.price,
        reviewsCount: data.reviewsCount,
        reviewsAverageRating: data.reviewsAverageRating,
      },
    };
  } catch (err) {
    if (err instanceof ScraperError && err.kind === "quota_exceeded") {
      return { ok: false, error: "quota_exceeded" };
    }
    return { ok: false, error: "scraper_failed" };
  }
}

export async function addProduct(
  rawAsin: string
): Promise<ActionResult<{ asin: string }>> {
  const session = await auth();
  const user = session?.user;
  if (!user?.email) {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = asinSchema.safeParse(rawAsin);
  if (!parsed.success) {
    return { ok: false, error: "invalid_asin" };
  }
  const asin = parsed.data;

  const existing = await prisma.product.findFirst({
    where: { amazonId: asin, userEmail: user.email },
    select: { id: true },
  });
  if (existing) {
    return { ok: false, error: "duplicate" };
  }

  let productData;
  try {
    productData = await productScraper(asin);
  } catch (err) {
    if (err instanceof ScraperError && err.kind === "quota_exceeded") {
      return { ok: false, error: "quota_exceeded" };
    }
    return { ok: false, error: "scraper_failed" };
  }

  try {
    await prisma.product.create({
      data: {
        ...productData,
        listPrice: productData.listPrice ?? productData.price,
        userEmail: user.email,
      },
    });

    await prisma.productDataHistory.create({
      data: {
        amazonId: asin,
        title: productData.title,
        img: productData.img,
        price: productData.price,
        reviewsCount: productData.reviewsCount,
        reviewsAverageRating: productData.reviewsAverageRating,
      },
    });
  } catch {
    return { ok: false, error: "db_error" };
  }

  revalidatePath("/");
  return { ok: true, data: { asin } };
}

export async function deleteProduct(id: number): Promise<ActionResult> {
  const session = await auth();
  const user = session?.user;
  if (!user?.email) {
    return { ok: false, error: "unauthorized" };
  }

  const productDoc = await prisma.product.findFirst({
    where: { id, userEmail: user.email },
  });

  if (!productDoc) {
    return { ok: false, error: "not_found" };
  }

  await prisma.product.delete({ where: { id } });
  await prisma.productDataHistory.deleteMany({
    where: { amazonId: productDoc.amazonId },
  });

  revalidatePath("/");
  return { ok: true };
}

export async function setTargetPrice(
  productId: number,
  cents: number
): Promise<ActionResult> {
  const session = await auth();
  const user = session?.user;
  if (!user?.email) {
    return { ok: false, error: "unauthorized" };
  }

  if (!Number.isInteger(cents) || cents <= 0) {
    return { ok: false, error: "invalid_price" };
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, userEmail: user.email },
    select: { id: true, amazonId: true },
  });
  if (!product) {
    return { ok: false, error: "not_found" };
  }

  await prisma.product.update({
    where: { id: product.id },
    data: { targetPrice: cents },
  });

  revalidatePath("/");
  revalidatePath(`/product/${product.amazonId}`);
  return { ok: true };
}

export async function clearTargetPrice(
  productId: number
): Promise<ActionResult> {
  const session = await auth();
  const user = session?.user;
  if (!user?.email) {
    return { ok: false, error: "unauthorized" };
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, userEmail: user.email },
    select: { id: true, amazonId: true },
  });
  if (!product) {
    return { ok: false, error: "not_found" };
  }

  await prisma.product.update({
    where: { id: product.id },
    data: { targetPrice: null },
  });

  revalidatePath("/");
  revalidatePath(`/product/${product.amazonId}`);
  return { ok: true };
}
