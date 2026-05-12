"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActivePath } from "@/lib/navigation";
import FilterControls from "./FilterControls";

export default function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => isActivePath(pathname, href);

  return (
    <aside className="flex flex-col gap-4 p-4 rounded-2xl bg-card/70 border border-border/60 backdrop-blur-sm h-fit sticky top-4">
      <h2 className="uppercase text-xs font-semibold tracking-wider text-muted-foreground">
        Navigation
      </h2>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent/60 text-foreground shadow-[0_0_24px_-8px_var(--primary)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
              )}
            >
              <span
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-gradient-to-b from-[#FF9900] to-[#FF6600] transition-opacity",
                  active ? "opacity-100" : "opacity-0"
                )}
                aria-hidden
              />
              <Icon
                size={20}
                className={cn(
                  "transition-colors",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {pathname === "/" && (
        <>
          <div className="h-px bg-border/60" />
          <h2 className="uppercase text-xs font-semibold tracking-wider text-muted-foreground">
            Filters
          </h2>
          <FilterControls />
        </>
      )}
    </aside>
  );
}
