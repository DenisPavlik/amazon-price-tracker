"use client";

import Image from "next/image";
import { Card } from "./ui/card";
import LineChart from "./LineChart";
import { Product, ProductDataHistory } from "../../generated/prisma";
// import TrackerTimeAgo from "./TrackerTimeAgo";
import dynamic from "next/dynamic";
import { Trash2, X } from "lucide-react";
import { Button } from "./ui/button";
import { deleteProduct } from "@/actions/productActions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import Link from "next/link";

const TrackerTimeAgo = dynamic(() => import("./TrackerTimeAgo"), {
  ssr: false,
});

export default function DashboardProductCard({
  product,
  history,
}: {
  product: Product;
  history: ProductDataHistory[];
}) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const initialPrice = history.length ? history[0].price : 0;
  const latestPrice = history.length ? history[history.length - 1].price : 0;

  const trend =
    latestPrice < initialPrice
      ? "green"
      : latestPrice > initialPrice
      ? "red"
      : "orange";

  const trendColor =
    trend === "green"
      ? "var(--chart-green)"
      : trend === "red"
      ? "var(--chart-red)"
      : "var(--chart-orange)";

  async function handleDelete(id: number) {
    setIsDeleting(true);

    const response = await deleteProduct(id);

    if (response) {
      toast.success("Item was deleted successfully!");
      router.refresh();
    } else {
      toast.error("Failed to delete product");
    }

    setIsDeleting(false);
    setOpen(false);
  }

  return (
    <Card className="relative pl-2 pr-4 py-8 md:p-4 overflow-hidden group">
      <div
        className="
      absolute right-0 top-0
      opacity-100 md:opacity-0 pointer-events-none transition-opacity duration-300
      group-hover:opacity-100 group-hover:pointer-events-auto
    "
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="destructive"
              className="w-8 h-8 rounded-none rounded-bl-md cursor-pointer"
            >
              <X size={16} />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Trash2 className="text-red-500" /> Confirm Deletion
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {product.title.slice(0, 40)}...
              </span>
              ? This action cannot be undone.
            </p>
            <DialogFooter className="mt-4 flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isDeleting}
                className="cursor-pointer border-gray-300"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(product.id)}
                disabled={isDeleting}
                className="cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex gap-2 md:gap-4 items-center">
        <Link
          href={`https://www.amazon.com/dp/${product.amazonId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src={product.img}
            alt="product_image"
            width={200}
            height={200}
            className="size-30 shrink-0"
          />
        </Link>
        <div className="grow">
          <h3 className="font-bold overflow-hidden text-ellipsis whitespace-nowrap">
            <div className="xl:hidden">
              {product.title.length > 20
                ? product.title.slice(0, 20) + "..."
                : product.title}
            </div>
            <div className="hidden xl:block">
              {product.title.length > 30
                ? product.title.slice(0, 30) + "..."
                : product.title}
            </div>
          </h3>
          <div className="flex flex-col">
            <div>
              <h4>${(product.price / 100).toFixed(2)}</h4>
              <h5 className="text-xs text-gray-600">
                <TrackerTimeAgo date={product.updatedAt} />
              </h5>
            </div>

            <div className="grow pt-4">
              <LineChart
                data={history
                  .map((hp) => ({
                    x: hp.createdAt.toISOString().slice(0, 10),
                    price: hp.price / 100,
                  }))
                  .sort((a, b) => a.x.localeCompare(b.x))}
                color={trendColor}
                trend={trend}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
