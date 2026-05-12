import { auth } from "@/auth";
import DashboardProductCard from "./DashboardProductCard";
import TopDropCard from "./TopDropCard";
import { prisma } from "@/lib/db";
import {
  getTopDropsThisWeek,
  getTotalSavingsAllTime,
} from "@/lib/queries";
import Link from "next/link";
import MobileFiltersSheet from "./MobileFiltersSheet";
import StaggerGrid from "./StaggerGrid";
import type { Product, ProductDataHistory } from "@/lib/types";

type SortKey =
  | "newest"
  | "oldest"
  | "drop"
  | "price-asc"
  | "price-desc"
  | "rating";

const SORT_KEYS: SortKey[] = [
  "newest",
  "oldest",
  "drop",
  "price-asc",
  "price-desc",
  "rating",
];

const isSort = (v: string | undefined): v is SortKey =>
  !!v && (SORT_KEYS as string[]).includes(v);

export default async function Dashboard({
  sort,
  q,
}: {
  sort?: string;
  q?: string;
}) {
  const session = await auth();
  const user = session?.user;
  if (!user || !user.email) {
    return null;
  }

  const products = await prisma.product.findMany({
    where: { userEmail: user.email },
  });

  if (products.length < 1) {
    return (
      <div className="col-span-12 md:col-span-9 p-4 text-center">
        <h1 className="font-semibold text-xl text-gray-700">
          You don&apos;t have any products yet!
        </h1>
        <p className="text-gray-500">
          Press{" "}
          <Link
            href="/add-product"
            className="underline text-orange-600 hover:text-orange-700 transition"
          >
            here
          </Link>{" "}
          to add your first product.
        </p>
      </div>
    );
  }

  const productIds = products.map((product) => product.amazonId);
  const history = await prisma.productDataHistory.findMany({
    where: { amazonId: { in: productIds } },
    orderBy: { createdAt: "asc" },
  });

  const [totalSavings, topDrops] = await Promise.all([
    getTotalSavingsAllTime(user.email),
    getTopDropsThisWeek(user.email, 3),
  ]);

  const sortKey: SortKey = isSort(sort) ? sort : "newest";
  const search = q?.trim().toLowerCase() ?? "";
  const filteredProducts = applyFilters(products, history, sortKey, search);

  return (
    <div className="col-span-12 md:col-span-9 p-4 space-y-6 md:space-y-8">
      <section>
        <header className="flex items-end justify-between gap-2 md:gap-4 mb-3">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Top Drops This Week
          </h2>
          <div className="text-sm text-muted-foreground text-right">
            Total Savings:{" "}
            <span
              className="font-display font-semibold"
              style={{ color: "var(--chart-green)" }}
            >
              ${(totalSavings / 100).toFixed(2)}
            </span>
          </div>
        </header>
        {topDrops.length > 0 ? (
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topDrops.map((deal) => (
              <TopDropCard key={deal.product.id} deal={deal} />
            ))}
          </StaggerGrid>
        ) : (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-6 text-center text-sm text-muted-foreground">
            No drops this week yet.
          </div>
        )}
      </section>

      <section>
        <header className="flex items-end justify-between gap-2 md:gap-4 mb-3">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            All Items
          </h2>
          <div className="flex items-center gap-2">
            <MobileFiltersSheet />
            <div className="text-sm text-muted-foreground">
              <span className="font-display font-semibold text-foreground">
                {filteredProducts.length === products.length
                  ? products.length
                  : `${filteredProducts.length} / ${products.length}`}
              </span>{" "}
              tracked
            </div>
          </div>
        </header>
        {filteredProducts.length > 0 ? (
          <StaggerGrid className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <DashboardProductCard
                key={product.id}
                product={product}
                history={history.filter(
                  (h) => h.amazonId === product.amazonId
                )}
              />
            ))}
          </StaggerGrid>
        ) : (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-6 text-center text-sm text-muted-foreground">
            No products match your filters.
          </div>
        )}
      </section>
    </div>
  );
}

function applyFilters(
  products: Product[],
  history: ProductDataHistory[],
  sort: SortKey,
  search: string
): Product[] {
  let result = products;
  if (search) {
    result = result.filter((p) => p.title.toLowerCase().includes(search));
  }

  const dropPctByAsin = new Map<string, number>();
  if (sort === "drop") {
    for (const product of result) {
      const productHistory = history.filter(
        (h) => h.amazonId === product.amazonId
      );
      const initialPrice = productHistory.length
        ? productHistory[0].price
        : product.price;
      const latestPrice = productHistory.length
        ? productHistory[productHistory.length - 1].price
        : product.price;
      const pct =
        initialPrice > 0
          ? ((initialPrice - latestPrice) / initialPrice) * 100
          : 0;
      dropPctByAsin.set(product.amazonId, pct);
    }
  }

  const sorted = [...result];
  switch (sort) {
    case "drop":
      sorted.sort(
        (a, b) =>
          (dropPctByAsin.get(b.amazonId) ?? 0) -
          (dropPctByAsin.get(a.amazonId) ?? 0)
      );
      break;
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      sorted.sort((a, b) => b.reviewsAverageRating - a.reviewsAverageRating);
      break;
    case "oldest":
      sorted.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      break;
    case "newest":
    default:
      sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  return sorted;
}
