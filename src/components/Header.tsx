"use client";
import Link from "next/link";
import { ChartNoAxesCombinedIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { Input } from "./ui/input";

type HeaderProps = {
  image: string | undefined;
  username: string;
};
export default function Header(props: HeaderProps) {
  return (
    <header className="flex justify-between items-center">
      <Link href={""} className="flex gap-1 items-center">
        <ChartNoAxesCombinedIcon className="mb-1" />
        Amzon price tracker
      </Link>
      <div className="flex items-center gap-4">
        <div>
          <Input placeholder="Search..." className="bg-gray-100 border-none" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src={props.image} />
              <AvatarFallback>{props.username.charAt(0)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Button className="w-full" onClick={() => signOut()}>
                  Log out
                </Button>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
