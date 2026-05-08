"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlignJustifyIcon,
  BellIcon,
  ChartNoAxesCombinedIcon,
  PackagePlusIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

type HeaderProps = {
  image: string | undefined;
  username: string;
  unreadCount?: number;
};

const NAV = [
  { href: "/", label: "Products", icon: AlignJustifyIcon },
  { href: "/add-product", label: "Add product", icon: PackagePlusIcon },
];

export default function Header({ image, username, unreadCount = 0 }: HeaderProps) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <header className="flex justify-between gap-2 items-center">
      <Link href="/" className="flex gap-1 items-center">
        <ChartNoAxesCombinedIcon className="mb-1 size-8 text-primary" />
        <h2 className="font-display text-3xl font-semibold text-brand-gradient">
          AmzPulse
        </h2>
      </Link>

      <nav className="hidden md:flex items-center gap-1">
        {NAV.map(({ href, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative px-3 py-2 text-sm font-medium rounded-md transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
              <span
                className={cn(
                  "absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-[#FF9900] to-[#FF6600] transition-opacity",
                  active ? "opacity-100" : "opacity-0"
                )}
              />
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-1.5">
        <Link
          href="/notifications"
          aria-label="Notifications"
          className={cn(
            "relative inline-flex items-center justify-center size-9 rounded-full transition-colors hover:bg-accent/60",
            isActive("/notifications") && "bg-accent/60"
          )}
        >
          <BellIcon className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-gradient-to-r from-[#FF9900] to-[#FF6600] text-[10px] font-semibold text-white grid place-items-center shadow-sm shadow-orange-500/40">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="ml-1 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full">
            <Avatar className="ring-1 ring-border">
              <AvatarImage src={image} />
              <AvatarFallback>{username.charAt(0)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup className="flex flex-col gap-1 md:hidden">
              <DropdownMenuItem asChild>
                <Link href="/" className="flex items-center gap-2">
                  <AlignJustifyIcon size={18} /> All products
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/add-product" className="flex items-center gap-2">
                  <PackagePlusIcon size={18} /> Add product
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/notifications" className="flex items-center gap-2">
                  <BellIcon size={18} /> Notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="md:hidden" />
            <DropdownMenuGroup>
              <Button className="w-full" onClick={() => signOut()}>
                Log out
              </Button>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
