import DashboardProductCard from "./DashboardProductCard";
import DashboardTopCard from "./DashboardTopCard";

export default function Dashboard() {
  return (
    <div className="col-span-9 p-4">
      <h2 className="font-bold my-2">Dashboard</h2>
      <div className="grid grid-cols-3 gap-4">
        <DashboardTopCard title="Price" value="$29.99" />
        <DashboardTopCard title="Reviews" value="4.8" />
        <DashboardTopCard title="Rank" value="352" />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <DashboardProductCard />
        <DashboardProductCard />
        <DashboardProductCard />
        <DashboardProductCard />
        <DashboardProductCard />
        <DashboardProductCard />
      </div>
    </div>
  );
}
