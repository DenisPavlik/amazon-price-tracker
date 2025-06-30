import LineChart from "./LineChart";
import { Card } from "./ui/card";

export default function DashboardProductCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <Card className="pt-4 pb-0">
      <div className="flex justify-between relative">
        <div className="flex flex-col absolute top-1 left-4">
          <span>{title}</span>
          <span className="font-bold">{value}</span>
        </div>
        <div className="grow h-24 overflow-hidden">
          <LineChart />
        </div>
      </div>
    </Card>
  );
}
