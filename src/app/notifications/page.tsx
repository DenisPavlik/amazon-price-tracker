import Link from "next/link";
import { BellIcon, TargetIcon, TrendingDownIcon } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

const TYPE_META = {
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

function metaFor(type: string) {
  return TYPE_META[type as keyof typeof TYPE_META] ?? {
    label: type,
    Icon: BellIcon,
    badge: "bg-muted text-muted-foreground border-border",
    icon: "text-muted-foreground",
  };
}

export default async function Notifications() {
  const session = await auth();
  const user = session?.user;
  if (!user || !user.email) {
    return null;
  }

  const notifications = await prisma.notification.findMany({
    where: { userEmail: user.email },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="col-span-12 md:col-span-9 p-4">
      <h2 className="font-bold uppercase text-lg text-muted-foreground my-2">
        Notifications
      </h2>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card/60 p-8 text-center">
          <BellIcon className="mx-auto size-8 text-muted-foreground/60" />
          <p className="mt-3 font-medium">No notifications yet</p>
          <p className="text-sm text-muted-foreground">
            We&apos;ll let you know when prices drop or your targets are hit.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {notifications.map((n) => {
            const m = metaFor(n.type);
            return (
              <li key={n.id}>
                <Link
                  href={`/product/${n.amazonId}`}
                  className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/70 px-4 py-3 transition-colors hover:bg-accent/40 hover:border-primary/40"
                >
                  <div
                    className={cn(
                      "shrink-0 grid place-items-center size-9 rounded-full bg-muted/40",
                      m.icon
                    )}
                  >
                    <m.Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
                          m.badge
                        )}
                      >
                        {m.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {n.createdAt.toISOString().slice(0, 10)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-snug">{n.title}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
