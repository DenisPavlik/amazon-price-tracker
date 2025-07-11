import {
  AlignJustifyIcon,
  BellIcon,
  PackagePlusIcon,
} from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside
      style={{ minHeight: `calc(100vh - 100px)` }}
      className="p-4 rounded-2xl bg-white h-full"
    >
      <h2 className="mb-2 uppercase text-xs font-extrabold text-gray-600">
        Navigation
      </h2>
      <nav className="flex flex-col gap-2 *:flex *:items-center *:gap-1">
        <Link href={"/"}>
          <AlignJustifyIcon size={26} /> All products
        </Link>
        <Link href={"/add-product"}>
          <PackagePlusIcon size={26} /> Add product
        </Link>
        <Link href={"/notifications"}>
          <BellIcon size={26} /> Notifications
        </Link>
      </nav>
    </aside>
  );
}
