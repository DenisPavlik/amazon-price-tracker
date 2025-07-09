import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export default async function Notifications() {
  const session = await auth();
  const user = session?.user;
  if (!user || !user.email) {
    return null;
  }

  const notifications = await prisma.notification.findMany({
    where: {
      userEmail: user.email,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className="col-span-12 md:col-span-9 p-4">
      <h2 className="font-bold my-2">Notifications</h2>
      <div className="flex flex-col gap-2">
        {notifications.map((notification) => (
          <div className="flex gap-4" key={notification.id}>
            <div className="text-gray-600 text-nowrap">
              {notification.createdAt.toISOString().slice(0, 10)}
            </div>
            <div>{notification.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
