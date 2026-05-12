"use client";

import { motion, useReducedMotion } from "motion/react";
import NotificationCard from "./NotificationCard";
import {
  headerSlideIn,
  listContainer,
} from "./motion-variants";

type Bucket = "Today" | "Yesterday" | "Earlier";

type NotificationItem = {
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

const BUCKETS: Bucket[] = ["Today", "Yesterday", "Earlier"];

export default function AnimatedNotificationGroups({
  groups,
}: {
  groups: Record<Bucket, NotificationItem[]>;
}) {
  const reduce = useReducedMotion();
  const initial = reduce ? false : "hidden";

  return (
    <div className="flex flex-col gap-6">
      {BUCKETS.map((bucket) =>
        groups[bucket].length === 0 ? null : (
          <motion.section
            key={bucket}
            variants={listContainer}
            initial={initial}
            animate="show"
          >
            <motion.h3
              variants={headerSlideIn}
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2"
            >
              {bucket}
            </motion.h3>
            <ul className="flex flex-col gap-2">
              {groups[bucket].map((n) => (
                <NotificationCard
                  key={n.id}
                  id={n.id}
                  kind={n.kind}
                  title={n.title}
                  amazonId={n.amazonId}
                  isRead={n.isRead}
                  priceFrom={n.priceFrom}
                  priceTo={n.priceTo}
                  createdAt={n.createdAt}
                  productImg={n.productImg}
                />
              ))}
            </ul>
          </motion.section>
        )
      )}
    </div>
  );
}
