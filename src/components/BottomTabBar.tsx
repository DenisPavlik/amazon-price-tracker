"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActivityIcon,
  BellIcon,
  HomeIcon,
  PlusIcon,
  UserCircleIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { isActivePath } from "@/lib/navigation";

type TabItem = {
  href: string;
  label: string;
  icon: typeof HomeIcon;
};

const LEFT_TABS: TabItem[] = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/activity", label: "Activity", icon: ActivityIcon },
];

const RIGHT_TABS: TabItem[] = [
  { href: "/notifications", label: "Alerts", icon: BellIcon },
];

type BottomTabBarProps = {
  unreadCount?: number;
  image?: string;
  username?: string;
  email?: string;
};

export default function BottomTabBar({
  unreadCount = 0,
  image,
  username = "User",
  email,
}: BottomTabBarProps) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const isActive = (href: string) => isActivePath(pathname, href);
  const addActive = isActive("/add-product");

  return (
    <>
      <nav
        aria-label="Primary"
        className={cn(
          "md:hidden fixed inset-x-0 bottom-0 z-40",
          "border-t border-border/60 bg-background/95 backdrop-blur",
          "pb-[env(safe-area-inset-bottom)]"
        )}
      >
        <div className="relative grid grid-cols-5 h-16">
          {LEFT_TABS.map((tab) => (
            <TabLink key={tab.href} tab={tab} active={isActive(tab.href)} />
          ))}

          <div className="relative flex items-center justify-center">
            <Link
              href="/add-product"
              aria-label="Add product"
              className={cn(
                "absolute -top-6 size-14 rounded-full grid place-items-center",
                "bg-gradient-to-br from-[#FF9900] to-[#FF6600] text-white",
                "shadow-lg shadow-orange-500/30 transition-transform",
                "hover:scale-105 active:scale-95",
                addActive &&
                  "ring-2 ring-primary/60 ring-offset-2 ring-offset-background"
              )}
            >
              <PlusIcon className="size-6" />
            </Link>
          </div>

          {RIGHT_TABS.map((tab) => (
            <TabLink
              key={tab.href}
              tab={tab}
              active={isActive(tab.href)}
              badge={tab.href === "/notifications" ? unreadCount : 0}
            />
          ))}

          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            aria-label="Profile"
            className={cn(
              "relative flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
              profileOpen
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {image ? (
              <Avatar className="size-5">
                <AvatarImage src={image} />
                <AvatarFallback className="text-[10px]">
                  {username.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <UserCircleIcon className="size-5" />
            )}
            <span>Profile</span>
          </button>
        </div>
      </nav>

      <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
        <SheetContent side="bottom" className="pb-[env(safe-area-inset-bottom)]">
          <SheetHeader>
            <SheetTitle className="sr-only">Profile</SheetTitle>
            <div className="flex items-center gap-3 py-2">
              <Avatar className="size-12 ring-1 ring-border">
                <AvatarImage src={image} />
                <AvatarFallback>{username.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left">
                <span className="font-medium">{username}</span>
                {email && (
                  <span className="text-sm text-muted-foreground">{email}</span>
                )}
              </div>
            </div>
          </SheetHeader>
          <div className="p-4">
            <Button className="w-full" onClick={() => signOut()}>
              Log out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function TabLink({
  tab,
  active,
  badge = 0,
}: {
  tab: TabItem;
  active: boolean;
  badge?: number;
}) {
  const Icon = tab.icon;
  return (
    <Link
      href={tab.href}
      className={cn(
        "relative flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <div className="relative">
        <Icon className="size-5" />
        {badge > 0 && (
          <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-gradient-to-r from-[#FF9900] to-[#FF6600] text-[10px] font-semibold text-white grid place-items-center shadow-sm shadow-orange-500/40">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </div>
      <span>{tab.label}</span>
    </Link>
  );
}
