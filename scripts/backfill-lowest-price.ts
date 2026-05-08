import { prisma } from "../src/lib/db";

async function main() {
  const products = await prisma.product.findMany({
    where: { lowestPrice: null },
    select: { id: true, amazonId: true, price: true },
  });

  console.log(`Backfilling lowestPrice for ${products.length} product(s)...`);

  for (const product of products) {
    const min = await prisma.productDataHistory.aggregate({
      where: { amazonId: product.amazonId },
      _min: { price: true },
    });

    const historicalMin = min._min.price;
    const lowest =
      historicalMin != null
        ? Math.min(historicalMin, product.price)
        : product.price;

    await prisma.product.update({
      where: { id: product.id },
      data: { lowestPrice: lowest },
    });

    console.log(`  product ${product.id} (${product.amazonId}): ${lowest}c`);
  }

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
