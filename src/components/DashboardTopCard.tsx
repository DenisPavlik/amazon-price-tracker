import LineChart from "./LineChart";
import { Card } from "./ui/card";

export default function DashboardTopCard({
  title = "Price",
  value = "$500",
  data,
}: {
  title: string;
  value: string;
  data?: {
    x: string;
    rating: number;
  }[];
}) {
  return (
    <Card className="pt-4 pb-0">
      <div className="flex justify-between relative">
        <div className="flex flex-col absolute top-1 left-4">
          <span>{title}</span>
          <span className="font-bold">{value}</span>
        </div>
        <div className="grow h-24 overflow-hidden">
          {data && (
            <LineChart data={data} />
          )}
        </div>
      </div>
    </Card>
  );
}
