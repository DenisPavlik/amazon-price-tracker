import Link from "next/link";
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

type HeaderProps = {
  image: string | undefined;
  username: string;
};
export default function Header(props: HeaderProps) {
  return (
    <header className="flex justify-between gap-2 items-center">
      <Link href={"/"} className="flex gap-1 items-center">
        <ChartNoAxesCombinedIcon className="mb-1 size-5" />
        AmzonPriceTracker
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
