import { auth } from "@/auth";
import DashboardProductCard from "./DashboardProductCard";
import DashboardTopCard from "./DashboardTopCard";
import { prisma } from "@/lib/db";
import { groupBy, sum } from "lodash";

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
  const productIds = products.map((product) => product.amazonId);
  const history = await prisma.productDataHistory.findMany({
    where: {
      amazonId: {
        in: productIds,
      },
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

  return (
    <div className="col-span-9 p-4">
      <h2 className="font-bold my-2">Dashboard</h2>
      <div className="grid grid-cols-3 gap-4">
        <DashboardTopCard title="Price" value="$29.99" />
        <DashboardTopCard title="Reviews" value="4.8" data={sortedReviewsAvgs} />
        <DashboardTopCard title="Rank" value="352" />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {products.map((product) => (
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
