import { auth } from "@/auth";
import DashboardProductCard from "./DashboardProductCard";
import DashboardTopCard from "./DashboardTopCard";
import { prisma } from "@/lib/db";
import { groupBy, sum } from "lodash";
import { useSearchParams } from "next/navigation";

export default async function Dashboard() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
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

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

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

  const historyByDates = groupBy(history, (h) =>
    h.createdAt.toISOString().slice(0, 10)
  );

  const reviewsAvgs: { x: string; rating: number }[] = [];

  for (const date of Object.keys(historyByDates).sort()) {
    const dateRatings = historyByDates[date].map(
      (hp) => hp.reviewsAverageRating / 10
    );
    reviewsAvgs.push({
      x: date,
      rating: sum(dateRatings) / dateRatings.length,
    });
  }
  const sortedReviewsAvgs = [...reviewsAvgs].sort((a, b) =>
    a.x.localeCompare(b.x)
  );

  let totalSavings = 0;

  for (const product of products) {
    const productHistory = history.filter(
      (h) => h.amazonId === product.amazonId
    );

    if (productHistory.length >= 2) {
      const initialPrice = productHistory[0].price;
      const latestPrice = productHistory[productHistory.length - 1].price;

      if (latestPrice < initialPrice) {
        totalSavings += initialPrice - latestPrice;
      }
    }
  }

  return (
    <div className="col-span-12 md:col-span-9 p-4">
      <h2 className="font-bold my-2">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <DashboardTopCard
          title="Total Savings 💸"
          value={`$${(totalSavings / 100).toFixed(2)}`}
        />
        <DashboardTopCard
          title="Reviews ⭐️"
          value="4.8"
          data={sortedReviewsAvgs}
        />
        <DashboardTopCard
          title="Tracked Items"
          value={`${products.length}`}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {filteredProducts.map((product) => (
          <DashboardProductCard
            key={product.id}
            product={product}
            history={history.filter(
              (history) => history.amazonId === product.amazonId
            )}
          />
        ))}
      </div>
    </div>
  );
}
