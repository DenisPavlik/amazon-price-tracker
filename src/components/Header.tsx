"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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

export default function Header({ image, username, unreadCount = 0 }: HeaderProps) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <header className="flex justify-between gap-2 items-center">
      <Link href="/" aria-label="AmzPulse home" className="group">
        <div className="flex items-center" style={{ gap: 10 }}>
          <svg
            viewBox="-2 -28 68 36"
            width="44"
            height="24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
            className="transition-transform group-hover:scale-105"
          >
            <defs>
              <linearGradient
                id="amzpulse-area"
                x1="0"
                y1="-24"
                x2="0"
                y2="8"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#FF9900" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#FF9900" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="amzpulse-line"
                x1="0"
                y1="0"
                x2="60"
                y2="0"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#FF6600" />
                <stop offset="100%" stopColor="#FFB800" />
              </linearGradient>
            </defs>
            <path
              d="M0,4 L12,-12 L24,8 L36,-20 L48,-2 L60,-16 L60,8 L0,8 Z"
              fill="url(#amzpulse-area)"
            />
            <polyline
              points="0,4 12,-12 24,8 36,-20 48,-2 60,-16"
              stroke="url(#amzpulse-line)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="60" cy="-16" r="3.5" fill="#FFB800" />
            <polyline
              points="56,-22 60,-26 64,-22"
              stroke="#FFB800"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            className="font-display leading-none tracking-tight"
            style={{ fontSize: 20, fontWeight: 500 }}
          >
            <span className="text-current">Amz</span>
            <span className="bg-gradient-to-r from-[#FF6600] to-[#FFB800] bg-clip-text text-transparent">
              Pulse
            </span>
          </span>
        </div>
      </Link>

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
