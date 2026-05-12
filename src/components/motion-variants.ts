import type { Variants, Transition } from "motion/react";

export const easeOutSoft: Transition["ease"] = [0.16, 1, 0.3, 1];

export const cardSpring: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 25,
};

export const listContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const slideInFromLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export const headerSlideIn: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

export const gridContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

export const cardRiseIn: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: cardSpring,
  },
};

export const sectionFadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOutSoft },
  },
};
