"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function addProduct(productId: string) {
  const response = await fetch(
    `https://api.rainforestapi.com/request?api_key=${process.env.RAINFOREST_API_KEY}&amazon_domain=amazon.com&asin=${productId}&type=product`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch from Rainforest API");
  }

  const session = await auth();
  const user = session?.user;
  if (!user || !user.email) {
    return false
  }

  const json = await response.json();
  const product = json.product;

  const { title, main_image, rating, buybox_winner, ratings_total } = product;
  const price = Math.round(buybox_winner?.price?.value ?? 0);

  const productRow = await prisma.product.upsert({
    where: { amazonId: productId },
    update: {
      title,
      img: main_image.link,
      price,
      reviewsCount: ratings_total,
      reviewsAverageRating: Math.round(rating * 10),
    },
    create: {
      userEmail: user.email,
      title,
      img: main_image.link,
      price,
      reviewsCount: ratings_total,
      reviewsAverageRating: Math.round(rating * 10),
      amazonId: productId,
    },
  });
  return productRow.id;
}
