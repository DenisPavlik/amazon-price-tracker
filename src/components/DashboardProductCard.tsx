"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  PackageXIcon,
  Star,
  Trash2,
  TrendingDown,
  TrendingUp,
  Minus,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import LineChart from "./LineChart";
import { Product, ProductDataHistory } from "../../generated/prisma";
import { deleteProduct } from "@/actions/productActions";
import { cn } from "@/lib/utils";

const TrackerTimeAgo = dynamic(() => import("./TrackerTimeAgo"), {
  ssr: false,
});

type Trend = "green" | "red" | "orange";

function StarRating({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <div className="relative inline-flex" aria-label={`${value.toFixed(1)} out of 5`}>
      <div className="flex text-muted-foreground/30">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={14} />
        ))}
      </div>
      <div
        className="absolute inset-0 flex text-amber-400 overflow-hidden"
        style={{ width: `${pct}%` }}
        aria-hidden
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={14} fill="currentColor" />
        ))}
      </div>
    </div>
  );
}

function DeltaBadge({ pct, trend }: { pct: number; trend: Trend }) {
  const Icon = trend === "green" ? TrendingDown : trend === "red" ? TrendingUp : Minus;
  const sign = trend === "green" ? "−" : trend === "red" ? "+" : "";
  const cls =
    trend === "green"
      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
      : trend === "red"
        ? "bg-red-500/10 text-red-500 border-red-500/30"
        : "bg-muted text-muted-foreground border-border";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold",
        cls
      )}
    >
      <Icon size={12} />
      {sign}
      {pct.toFixed(0)}%
    </span>
  );
}

export default function DashboardProductCard({
  product,
  history,
}: {
  product: Product;
  history: ProductDataHistory[];
}) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const isUnavailable = product.price === 0;
  const initialPrice = history.length ? history[0].price : product.price;
  const latestPrice = history.length
    ? history[history.length - 1].price
    : product.price;

  const trend: Trend =
    latestPrice < initialPrice
      ? "green"
      : latestPrice > initialPrice
        ? "red"
        : "orange";

  const trendColor =
    trend === "green"
      ? "var(--chart-green)"
      : trend === "red"
        ? "var(--chart-red)"
        : "var(--chart-orange)";

  const deltaPct =
    initialPrice > 0
      ? Math.abs(((latestPrice - initialPrice) / initialPrice) * 100)
      : 0;

  const rating = product.reviewsAverageRating / 10;

  async function handleDelete(id: number) {
    setIsDeleting(true);
    const response = await deleteProduct(id);
    if (response.ok) {
      toast.success("Item was deleted successfully!");
      router.refresh();
    } else {
      toast.error("Failed to delete product");
    }
    setIsDeleting(false);
    setOpen(false);
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden p-0 group transition-all duration-300",
        "hover:shadow-[0_0_0_1px_var(--primary),0_10px_40px_-12px_rgb(255_153_0_/_0.35)]",
        "hover:-translate-y-0.5",
        isUnavailable && "opacity-60 saturate-50"
      )}
    >
      <Link
        href={`/product/${product.amazonId}`}
        className="block p-4 md:p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
      >
        <div className="flex gap-3 md:gap-4 items-start">
          <div className="relative size-24 md:size-28 shrink-0 rounded-lg overflow-hidden bg-muted/40 border border-border/60">
            <Image
              src={product.img}
              alt={product.title}
              fill
              sizes="120px"
              className="object-contain p-2"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <h3 className="font-semibold leading-snug line-clamp-2 flex-1">
                {product.title}
              </h3>
              {isUnavailable ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted text-muted-foreground px-2 py-0.5 text-xs font-semibold">
                  <PackageXIcon size={12} />
                  Unavailable
                </span>
              ) : (
                <DeltaBadge pct={deltaPct} trend={trend} />
              )}
            </div>

            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <StarRating value={rating} />
              <span>
                {rating.toFixed(1)}
                <span className="ml-1 opacity-70">({product.reviewsCount})</span>
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              {isUnavailable ? (
                <span className="font-display text-2xl font-semibold tracking-tight text-muted-foreground">
                  N/A
                </span>
              ) : (
                <>
                  <span className="font-display text-2xl font-semibold tracking-tight">
                    ${(product.price / 100).toFixed(2)}
                  </span>
                  {product.lowestPrice != null &&
                    product.lowestPrice < product.price && (
                      <span className="text-xs text-muted-foreground">
                        low ${(product.lowestPrice / 100).toFixed(2)}
                      </span>
                    )}
                  {product.targetPrice != null && (
                    <span className="text-xs text-primary/90">
                      · target ${(product.targetPrice / 100).toFixed(2)}
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground/80 mt-0.5">
              <TrackerTimeAgo date={product.updatedAt} />
            </div>

            <div className="mt-3 -mx-1">
              <LineChart
                data={history
                  .map((hp) => ({
                    x: hp.createdAt.toISOString().slice(0, 10),
                    price: hp.price / 100,
                  }))
                  .sort((a, b) => a.x.localeCompare(b.x))}
                color={trendColor}
                trend={trend}
              />
            </div>
          </div>
        </div>
      </Link>

      <div
        className={cn(
          "absolute right-2 top-2 z-10 transition-opacity duration-200",
          "opacity-0 group-hover:opacity-100 focus-within:opacity-100",
          "md:opacity-0"
        )}
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="destructive"
              aria-label="Delete product"
              className="size-8 rounded-full shadow-md"
              onClick={(e) => e.stopPropagation()}
            >
              <X size={14} />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm" onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Trash2 className="text-red-500" /> Confirm deletion
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Delete{" "}
              <span className="font-medium text-foreground">
                {product.title.length > 60
                  ? product.title.slice(0, 60) + "…"
                  : product.title}
              </span>
              ? This action cannot be undone.
            </p>
            <DialogFooter className="mt-4 flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(product.id)}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}
