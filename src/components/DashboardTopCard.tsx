import { Card } from "./ui/card";

export default function DashboardTopCard({
  title = "Price",
  value = "$500",
}: {
  title: string;
  value: string;
}) {
  return (
    <Card className="pt-4 pb-0 overflow-hidden">
      <div className="flex justify-between items-start">
        <div className="flex flex-col px-4 pb-4">
          <span className="text-nowrap">{title}</span>
          <span className="font-bold">{value}</span>
        </div>
      </div>
    </Card>
  );
}
