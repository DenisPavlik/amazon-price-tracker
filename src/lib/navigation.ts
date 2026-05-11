import {
  ActivityIcon,
  AlignJustifyIcon,
  BellIcon,
  PackagePlusIcon,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "All products", icon: AlignJustifyIcon },
  { href: "/add-product", label: "Add product", icon: PackagePlusIcon },
  { href: "/activity", label: "Activity", icon: ActivityIcon },
  { href: "/notifications", label: "Notifications", icon: BellIcon },
];

export function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
