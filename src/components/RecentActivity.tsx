import Image from "next/image";
import Link from "next/link";
import {
  ActivityIcon,
  TargetIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/lib/queries";

const KIND_META = {
  PRICE_DROP: {
    label: "Price drop",
    Icon: TrendingDownIcon,
    badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  },
  TARGET_HIT: {
    label: "Target hit",
    Icon: TargetIcon,
    badge: "bg-primary/10 text-primary border-primary/30",
  },
  PRICE_CHANGE: {
    label: "Price change",
    Icon: ActivityIcon,
    badge: "bg-muted text-muted-foreground border-border",
  },
} as const;

function formatDelta(from: number | null, to: number) {
  if (from == null) return null;
  const diff = to - from;
  const pct = from === 0 ? 0 : (diff / from) * 100;
  return {
    fromUsd: (from / 100).toFixed(2),
    toUsd: (to / 100).toFixed(2),
    pct: pct.toFixed(1),
    negative: diff < 0,
  };
}

export default function RecentActivity({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-6 text-center text-sm text-muted-foreground">
        No recent activity yet.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => {
        const meta = KIND_META[item.kind];
        const delta = formatDelta(item.priceFrom, item.priceTo);
        const ChangeIcon =
          item.kind === "PRICE_CHANGE" && delta && !delta.negative
            ? TrendingUpIcon
            : meta.Icon;

        return (
          <li key={item.id}>
            <Link
              href={`/product/${item.amazonId}`}
              className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/70 px-3 py-2.5 transition-colors hover:bg-accent/40 hover:border-primary/40"
            >
              {item.img ? (
                <div className="relative size-10 shrink-0 rounded-md overflow-hidden bg-muted/40 border border-border/60">
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    sizes="40px"
                    className="object-contain p-1"
                  />
                </div>
              ) : (
                <div className="shrink-0 grid place-items-center size-10 rounded-md bg-muted/40 border border-border/60 text-muted-foreground">
                  <ChangeIcon size={16} />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                      meta.badge
                    )}
                  >
                    <ChangeIcon size={10} />
                    {meta.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {item.at.toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-0.5 text-sm leading-snug line-clamp-1">
                  {item.title}
                </p>
              </div>

              {delta && (
                <div className="shrink-0 text-right">
                  <div className="font-display text-sm font-semibold tracking-tight">
                    ${delta.toUsd}
                  </div>
                  <div
                    className={cn(
                      "text-[11px] font-medium",
                      delta.negative
                        ? "text-emerald-500"
                        : "text-muted-foreground"
                    )}
                  >
                    {delta.negative ? "" : "+"}
                    {delta.pct}%
                  </div>
                </div>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
