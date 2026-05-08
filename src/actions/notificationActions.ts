"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function requireEmail() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;
  return email;
}

function revalidateNotificationViews() {
  revalidatePath("/notifications");
  revalidatePath("/");
}

export async function markRead(id: number) {
  const email = await requireEmail();
  if (!email) return false;

  const result = await prisma.notification.updateMany({
    where: { id, userEmail: email },
    data: { isRead: true },
  });

  if (result.count === 0) return false;
  revalidateNotificationViews();
  return true;
}

export async function markAllRead() {
  const email = await requireEmail();
  if (!email) return false;

  await prisma.notification.updateMany({
    where: { userEmail: email, isRead: false },
    data: { isRead: true },
  });

  revalidateNotificationViews();
  return true;
}

export async function deleteNotification(id: number) {
  const email = await requireEmail();
  if (!email) return false;

  const result = await prisma.notification.deleteMany({
    where: { id, userEmail: email },
  });

  if (result.count === 0) return false;
  revalidateNotificationViews();
  return true;
}
