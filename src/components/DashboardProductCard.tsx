"use client";

import Image from "next/image";
import { Card } from "./ui/card";
import LineChart from "./LineChart";
import { Product, ProductDataHistory } from "../../generated/prisma";
import TrackerTimeAgo from "./TrackerTimeAgo";

export default function DashboardProductCard({
  product,
  history,
}: {
  product: Product;
  history: ProductDataHistory[];
}) {
  return (
    <Card className="p-4 overflow-hidden">
      <div className="flex gap-4 items-center">
        <Image
          src={product.img}
          alt="product_image"
          width={200}
          height={200}
          className="size-30"
        />
        <div className="grow">
          <h3 className="font-bold overflow-hidden text-ellipsis whitespace-nowrap">
            {product.title.length > 30
              ? product.title.slice(0, 30) + "..."
              : product.title}
          </h3>
          <div className="flex">
            <div>
              <h4>${(product.price / 100).toFixed(2)}</h4>
              <h5 className="text-xs text-gray-600">
                <TrackerTimeAgo date={product.createdAt} />
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
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
