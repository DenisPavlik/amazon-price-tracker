import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, ExternalLinkIcon, Star } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProductDetailChart from "@/components/ProductDetailChart";
import SetTargetPriceForm from "@/components/SetTargetPriceForm";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/price";

function fmtPrice(cents: number | null | undefined) {
  if (cents == null) return "—";
  return formatPrice(cents);
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ asin: string }>;
}) {
  const { asin } = await params;
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return notFound();

  const product = await prisma.product.findFirst({
    where: { amazonId: asin, userEmail: email },
  });
  if (!product) return notFound();

  const history = await prisma.productDataHistory.findMany({
    where: { amazonId: asin },
    orderBy: { createdAt: "asc" },
  });

  const sorted = history.length
    ? history
    : [
        {
          id: -1,
          amazonId: asin,
          title: product.title,
          img: product.img,
          price: product.price,
          reviewsCount: product.reviewsCount,
          reviewsAverageRating: product.reviewsAverageRating,
          createdAt: product.createdAt,
        },
      ];

  const prices = sorted.map((h) => h.price);
  const initial = prices[0];
  const latest = prices[prices.length - 1];
  const lowest = product.lowestPrice ?? Math.min(...prices);
  const highest = Math.max(...prices);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const within30 = sorted.filter((h) => h.createdAt >= cutoff);
  const ref30 = within30.length > 0 ? within30[0].price : initial;
  const change30Pct = ref30 > 0 ? ((latest - ref30) / ref30) * 100 : 0;

  const trend: "green" | "red" | "orange" =
    latest < initial ? "green" : latest > initial ? "red" : "orange";

  const chartData = sorted.map((h) => ({
    x: h.createdAt.toISOString().slice(0, 10),
    price: h.price / 100,
  }));

  const rating = product.reviewsAverageRating / 10;

  const tableRows = [...sorted].reverse().map((h, idx, arr) => {
    const prev = arr[idx + 1];
    const delta = prev ? h.price - prev.price : 0;
    return { ...h, delta };
  });

  return (
    <div className="col-span-12 md:col-span-9 p-4 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2">
          <Link href="/">
            <ArrowLeftIcon size={16} /> All products
          </Link>
        </Button>
      </div>

      <Card className="p-5 md:p-6 flex flex-col md:flex-row gap-5 md:gap-6">
        <div className="relative size-32 md:size-40 shrink-0 rounded-xl overflow-hidden bg-muted/40 border border-border/60">
          <Image
            src={product.img}
            alt={product.title}
            fill
            sizes="160px"
            className="object-contain p-3"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <h1 className="font-display text-2xl md:text-3xl font-semibold leading-tight">
            {product.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Star size={14} className="text-amber-400" fill="currentColor" />
              {rating.toFixed(1)}
            </span>
            <span>·</span>
            <span>{product.reviewsCount.toLocaleString()} reviews</span>
            <span>·</span>
            <span className="font-mono">{product.amazonId}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Button asChild className="gap-2">
              <a
                href={`https://www.amazon.com/dp/${product.amazonId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLinkIcon size={16} /> Open on Amazon
              </a>
            </Button>
            <SetTargetPriceForm
              productId={product.id}
              initialTargetCents={product.targetPrice}
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Current" value={fmtPrice(latest)} />
        <Stat label="Lowest" value={fmtPrice(lowest)} accent="green" />
        <Stat label="Highest" value={fmtPrice(highest)} accent="red" />
        <Stat
          label="30d change"
          value={`${change30Pct >= 0 ? "+" : ""}${change30Pct.toFixed(1)}%`}
          accent={
            change30Pct < 0 ? "green" : change30Pct > 0 ? "red" : "neutral"
          }
        />
      </div>

      <Card className="p-4 md:p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Price history
        </h2>
        <ProductDetailChart data={chartData} trend={trend} />
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border/60">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            History
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="px-5 py-2 font-medium">Date</th>
                <th className="px-5 py-2 font-medium">Price</th>
                <th className="px-5 py-2 font-medium">Δ vs previous</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.id} className="border-b border-border/40 last:border-0">
                  <td className="px-5 py-2 text-muted-foreground">
                    {row.createdAt.toISOString().slice(0, 10)}
                  </td>
                  <td className="px-5 py-2 font-mono">
                    {formatPrice(row.price)}
                  </td>
                  <td
                    className={cn(
                      "px-5 py-2 font-mono",
                      row.delta < 0 && "text-emerald-500",
                      row.delta > 0 && "text-red-500",
                      row.delta === 0 && "text-muted-foreground"
                    )}
                  >
                    {row.delta === 0
                      ? "—"
                      : `${row.delta > 0 ? "+" : "−"}$${(
                          Math.abs(row.delta) / 100
                        ).toFixed(2)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = "neutral",
}: {
  label: string;
  value: string;
  accent?: "green" | "red" | "neutral";
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/70 p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 font-display text-2xl font-semibold tracking-tight",
          accent === "green" && "text-emerald-500",
          accent === "red" && "text-red-500"
        )}
      >
        {value}
      </div>
    </div>
  );
}
