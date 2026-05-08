"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import {
  BellIcon,
  CheckIcon,
  TargetIcon,
  Trash2Icon,
  TrendingDownIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  deleteNotification,
  markRead,
} from "@/actions/notificationActions";

type Props = {
  id: number;
  kind: "PRICE_DROP" | "TARGET_HIT";
  title: string;
  amazonId: string;
  isRead: boolean;
  priceFrom: number | null;
  priceTo: number | null;
  createdAt: Date;
  productImg: string | null;
};

const KIND_META = {
  PRICE_DROP: {
    label: "Price drop",
    Icon: TrendingDownIcon,
    badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    icon: "text-emerald-500",
  },
  TARGET_HIT: {
    label: "Target hit",
    Icon: TargetIcon,
    badge: "bg-primary/10 text-primary border-primary/30",
    icon: "text-primary",
  },
} as const;

function formatDelta(from: number | null, to: number | null) {
  if (from == null || to == null) return null;
  const diff = to - from;
  const pct = from === 0 ? 0 : (diff / from) * 100;
  return {
    fromUsd: (from / 100).toFixed(2),
    toUsd: (to / 100).toFixed(2),
    pct: pct.toFixed(1),
    negative: diff < 0,
  };
}

export default function NotificationCard(props: Props) {
  const meta = KIND_META[props.kind] ?? {
    label: props.kind,
    Icon: BellIcon,
    badge: "bg-muted text-muted-foreground border-border",
    icon: "text-muted-foreground",
  };
  const delta = formatDelta(props.priceFrom, props.priceTo);
  const [isPending, startTransition] = useTransition();

  const onMarkRead = () => {
    if (props.isRead) return;
    startTransition(() => {
      markRead(props.id);
    });
  };

  const onDelete = () => {
    startTransition(() => {
      deleteNotification(props.id);
    });
  };

  return (
    <li
      className={cn(
        "group relative flex items-stretch gap-3 rounded-xl border bg-card/70 px-3 py-3 transition-colors hover:bg-accent/40 hover:border-primary/40",
        props.isRead
          ? "border-border/60 opacity-80"
          : "border-primary/40 bg-card",
        isPending && "opacity-50"
      )}
    >
      {!props.isRead && (
        <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-primary" />
      )}

      <Link
        href={`/product/${props.amazonId}`}
        className="flex flex-1 min-w-0 items-start gap-3"
      >
        {props.productImg ? (
          <div className="relative size-14 shrink-0 rounded-lg overflow-hidden bg-muted/40 border border-border/60">
            <Image
              src={props.productImg}
              alt={props.title}
              fill
              sizes="56px"
              className="object-contain p-1"
            />
          </div>
        ) : (
          <div
            className={cn(
              "shrink-0 grid place-items-center size-14 rounded-lg bg-muted/40 border border-border/60",
              meta.icon
            )}
          >
            <meta.Icon size={20} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
                meta.badge
              )}
            >
              {meta.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {props.createdAt.toLocaleDateString()}
            </span>
          </div>
          <p className="mt-1 text-sm leading-snug line-clamp-2">
            {props.title}
          </p>
          {delta && (
            <div className="mt-1 flex items-center gap-2 text-sm">
              <span className="text-muted-foreground line-through">
                ${delta.fromUsd}
              </span>
              <span className="font-semibold">${delta.toUsd}</span>
              <span
                className={cn(
                  "text-xs font-semibold",
                  delta.negative ? "text-emerald-500" : "text-muted-foreground"
                )}
              >
                {delta.negative ? "" : "+"}
                {delta.pct}%
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-col gap-1 shrink-0 self-center">
        {!props.isRead && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Mark as read"
            onClick={onMarkRead}
            disabled={isPending}
          >
            <CheckIcon className="size-4" />
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Delete notification"
          onClick={onDelete}
          disabled={isPending}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2Icon className="size-4" />
        </Button>
      </div>
    </li>
  );
}
