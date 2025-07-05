export async function productScraper(productId: string) {
  const response = await fetch(
    `https://api.rainforestapi.com/request?api_key=${process.env.RAINFOREST_API_KEY}&amazon_domain=amazon.com&asin=${productId}&type=product`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch from Rainforest API");
  }

  const json = await response.json();
  const product = json.product;

  const { title, main_image, rating, buybox_winner, ratings_total } = product;
  const price = Math.round((buybox_winner?.price?.value ?? 0) * 100);

  return {
    title,
    img: main_image.link,
    price,
    reviewsCount: ratings_total,
    reviewsAverageRating: Math.round(rating * 10),
    amazonId: productId,
  };
}
