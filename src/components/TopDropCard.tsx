import Image from "next/image";
import Link from "next/link";
import { TrendingDown } from "lucide-react";

import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import type { TopDrop } from "@/lib/queries";

export default function TopDropCard({ deal }: { deal: TopDrop }) {
  const { product, oldPrice, newPrice, dropPct } = deal;

  return (
    <Card
      className={cn(
        "relative overflow-hidden p-0 group transition-all duration-300",
        "hover:shadow-[0_0_0_1px_var(--primary),0_10px_40px_-12px_rgb(255_153_0_/_0.35)]",
        "hover:-translate-y-0.5"
      )}
    >
      <Link
        href={`/product/${product.amazonId}`}
        className="block p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl h-full"
      >
        <div className="flex gap-3 items-start">
          <div className="relative size-16 shrink-0 rounded-lg overflow-hidden bg-muted/40 border border-border/60">
            <Image
              src={product.img}
              alt={product.title}
              fill
              sizes="64px"
              className="object-contain p-1.5"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <h3 className="text-sm font-medium leading-snug line-clamp-2 flex-1">
                {product.title}
              </h3>
              <span
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold shrink-0"
                style={{
                  color: "var(--chart-green)",
                  borderColor:
                    "color-mix(in oklch, var(--chart-green) 35%, var(--border))",
                  backgroundColor:
                    "color-mix(in oklch, var(--chart-green) 10%, transparent)",
                }}
              >
                <TrendingDown className="size-3" />−{dropPct.toFixed(0)}%
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-xl font-semibold tracking-tight">
                ${(newPrice / 100).toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                ${(oldPrice / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}
