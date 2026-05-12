import { auth } from "@/auth";
import RecentActivity from "@/components/RecentActivity";
import { getRecentActivity } from "@/lib/queries";

export default async function ActivityPage() {
  const session = await auth();
  const user = session?.user;
  if (!user?.email) return null;

  const items = await getRecentActivity(user.email, 50);

  return (
    <div className="col-span-12 md:col-span-9 p-4 space-y-4">
      <header className="flex items-end justify-between gap-2 md:gap-4">
        <h1 className="font-display text-xl font-semibold tracking-tight">
          Activity
        </h1>
        <span className="text-sm text-muted-foreground">
          Latest{" "}
          <span className="font-display font-semibold text-foreground">
            {items.length}
          </span>{" "}
          events
        </span>
      </header>
      <RecentActivity items={items} />
    </div>
  );
}
