import { prisma } from "../src/lib/db";
import { productScraper, ScraperError } from "../src/lib/productScraper";

async function main() {
  const products = await prisma.product.findMany({
    where: { listPrice: null },
    select: { id: true, amazonId: true, price: true },
  });

  console.log(`Backfilling listPrice for ${products.length} product(s)...`);

  for (const product of products) {
    try {
      const scraped = await productScraper(product.amazonId);
      const listPrice = scraped.listPrice ?? product.price;

      await prisma.product.update({
        where: { id: product.id },
        data: { listPrice },
      });

      console.log(
        `  product ${product.id} (${product.amazonId}): listPrice=${listPrice}c` +
          (scraped.listPrice == null ? " (fallback to current)" : "")
      );
    } catch (err) {
      if (err instanceof ScraperError && err.kind === "quota_exceeded") {
        console.error(
          `  product ${product.id} (${product.amazonId}): quota exceeded, stopping.`
        );
        break;
      }
      console.error(
        `  product ${product.id} (${product.amazonId}): failed —`,
        err instanceof Error ? err.message : err
      );
    }
  }

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
