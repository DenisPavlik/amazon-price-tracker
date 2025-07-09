import Dashboard from "@/components/Dashboard";

export default function Home({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  return <Dashboard search={searchParams?.search || ""} />;
}
