"use client";

import { useTransition } from "react";
import { CheckCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markAllRead } from "@/actions/notificationActions";

export default function MarkAllReadButton() {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => { markAllRead(); })}
    >
      <CheckCheckIcon className="size-4" />
      Mark all as read
    </Button>
  );
}
