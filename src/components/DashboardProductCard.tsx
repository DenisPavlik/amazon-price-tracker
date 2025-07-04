'use client'

import Image from "next/image";
import { Card } from "./ui/card";
import LineChart from "./LineChart";
import { Product } from "../../generated/prisma";
import ReactTimeAgo from 'react-time-ago'
import TimeAgo from 'javascript-time-ago'

import en from 'javascript-time-ago/locale/en'
TimeAgo.addDefaultLocale(en)

export default function DashboardProductCard({product}: {product: Product}) {
  return (
    <Card className="p-4 overflow-hidden">
      <div className="flex gap-4">
        <Image
          src={product.img}
          alt="product_image"
          width={200}
          height={200}
          className="size-40"
        />
        <div className="relative grow flex items-end">
          <div className="absolute top-4 left-0 w-full">
            <h3 className="font-bold">{product.title.charAt(10)}</h3>
            <h4>${(product.price / 100).toFixed(2)}</h4>
            <h5 className="text-xs text-gray-600">
              <ReactTimeAgo date={product.updatedAt}/>
            </h5>
            <div className="grow -ml-4 -mr-7">
              <LineChart />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
