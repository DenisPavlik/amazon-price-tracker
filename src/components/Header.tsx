"use client";

import Link from "next/link";
import {
  AlignJustifyIcon,
  BellIcon,
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

type HeaderProps = {
  image: string | undefined;
  username: string;
};
export default function Header(props: HeaderProps) {
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
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src={props.image} />
              <AvatarFallback>{props.username.charAt(0)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup className="flex flex-col gap-1 md:hidden">
              <DropdownMenuItem>
                <Link href={"/"} className="flex items-center gap-1">
                  <AlignJustifyIcon size={26} /> All products
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href={"/add-product"} className="flex items-center gap-1">
                  <PackagePlusIcon size={26} /> Add product
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href={"/notifications"}
                  className="flex items-center gap-1"
                >
                  <BellIcon size={26} /> Notifications
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
