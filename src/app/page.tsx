import { auth } from "@/auth";
import Dashboard from "@/components/Dashboard";
import Header from "@/components/Header";
import LoginView from "@/components/LoginView";
import Sidebar from "@/components/Sidebar";

export default async function Home() {
  const session = await auth();

  if (!session) {
    return <LoginView />;
  }
  return (
    <div className="p-4 h-screen">
      <Header
        image={session.user?.image ?? undefined}
        username={session.user?.name ?? 'User'} />
      <section className="grid grid-cols-12 gap-4 mt-4">
        <div className="col-span-3 pb-4">
          <Sidebar />
        </div>
        <Dashboard />
      </section>
    </div>
  );
}
