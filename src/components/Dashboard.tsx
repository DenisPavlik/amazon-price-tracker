import { auth } from "@/auth";
import DashboardProductCard from "./DashboardProductCard";
import TopDropCard from "./TopDropCard";
import { prisma } from "@/lib/db";
import { getTopDropsThisWeek, getTotalSavingsAllTime } from "@/lib/queries";
import Link from "next/link";

export default async function Dashboard() {
  const session = await auth();
  const user = session?.user;
  if (!user || !user.email) {
    return null;
  }

  const products = await prisma.product.findMany({
    where: {
      userEmail: user.email,
    },
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
    where: {
      amazonId: {
        in: productIds,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const [totalSavings, topDrops] = await Promise.all([
    getTotalSavingsAllTime(user.email),
    getTopDropsThisWeek(user.email, 3),
  ]);

  return (
    <div className="col-span-12 md:col-span-9 p-4 space-y-8">
      <section>
        <header className="flex items-end justify-between gap-4 mb-3">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Top Drops This Week
          </h2>
          <div className="text-sm text-muted-foreground">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topDrops.map((deal) => (
              <TopDropCard key={deal.product.id} deal={deal} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-6 text-center text-sm text-muted-foreground">
            No drops this week yet.
          </div>
        )}
      </section>

      <section>
        <header className="flex items-end justify-between gap-4 mb-3">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            All Items
          </h2>
          <div className="text-sm text-muted-foreground">
            <span className="font-display font-semibold text-foreground">
              {products.length}
            </span>{" "}
            tracked
          </div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {products.map((product) => (
            <DashboardProductCard
              key={product.id}
              product={product}
              history={history.filter(
                (h) => h.amazonId === product.amazonId
              )}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
