import Image from "next/image";
import { Card } from "./ui/card";
import LineChart from "./LineChart";

export default function DashboardProductCard() {
  return (
    <Card className="p-4 overflow-hidden">
      <div className="flex gap-4">
        <Image
          src={"https://m.media-amazon.com/images/I/71SKOyjXoUL._AC_SX466_.jpg"}
          alt="product_image"
          width={200}
          height={200}
          className="size-40"
        />
        <div className="relative grow flex items-end">
          <div className="absolute top-4 left-0 w-full">
            <h3 className="font-bold">Apple Watch Ultra 2</h3>
            <h4>$799.00</h4>
            <h5 className="text-xs text-gray-600">4 hours ago</h5>
            <div className="grow -ml-4 -mr-7">
              <LineChart />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
