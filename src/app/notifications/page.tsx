import { BellIcon } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import AnimatedNotificationGroups from "@/components/AnimatedNotificationGroups";
import MarkAllReadButton from "@/components/MarkAllReadButton";

type Bucket = "Today" | "Yesterday" | "Earlier";

function bucketFor(date: Date): Bucket {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const t = date.getTime();
  if (t >= startOfToday) return "Today";
  if (t >= startOfToday - dayMs) return "Yesterday";
  return "Earlier";
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
    include: { product: true },
  });

  const groups: Record<Bucket, ReturnType<typeof toItem>[]> = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  };
  for (const n of notifications) groups[bucketFor(n.createdAt)].push(toItem(n));

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="col-span-12 md:col-span-9 p-4">
      <div className="flex items-center justify-between gap-2 md:gap-4 my-2">
        <h2 className="font-bold uppercase text-lg text-muted-foreground">
          Notifications
        </h2>
        {hasUnread && <MarkAllReadButton />}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card/60 p-8 text-center">
          <BellIcon className="mx-auto size-8 text-muted-foreground/60" />
          <p className="mt-3 font-medium">No notifications yet</p>
          <p className="text-sm text-muted-foreground">
            We&apos;ll let you know when prices drop or your targets are hit.
          </p>
        </div>
      ) : (
        <AnimatedNotificationGroups groups={groups} />
      )}
    </div>
  );
}

function toItem(n: {
  id: number;
  kind: string;
  title: string;
  amazonId: string;
  isRead: boolean;
  priceFrom: number | null;
  priceTo: number | null;
  createdAt: Date;
  product: { img: string } | null;
}) {
  return {
    id: n.id,
    kind: n.kind as "PRICE_DROP" | "TARGET_HIT",
    title: n.title,
    amazonId: n.amazonId,
    isRead: n.isRead,
    priceFrom: n.priceFrom,
    priceTo: n.priceTo,
    createdAt: n.createdAt,
    productImg: n.product?.img ?? null,
  };
}
