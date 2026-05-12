"use client";

import { motion, useReducedMotion } from "motion/react";
import { Children } from "react";
import { cardRiseIn, gridContainer } from "./motion-variants";
import { cn } from "@/lib/utils";

export default function StaggerGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      variants={gridContainer}
      initial="hidden"
      animate="show"
    >
      {Children.map(children, (child, i) => (
        <motion.div key={i} variants={cardRiseIn}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
