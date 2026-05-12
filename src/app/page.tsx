import Dashboard from "@/components/Dashboard";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; q?: string }>;
}) {
  const params = await searchParams;
  return <Dashboard sort={params.sort} q={params.q} />;
}
