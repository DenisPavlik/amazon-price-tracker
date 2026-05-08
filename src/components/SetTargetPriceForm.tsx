"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Target, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clearTargetPrice, setTargetPrice } from "@/actions/productActions";

export default function SetTargetPriceForm({
  productId,
  initialTargetCents,
}: {
  productId: number;
  initialTargetCents: number | null;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(
    initialTargetCents != null ? (initialTargetCents / 100).toFixed(2) : ""
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function submit() {
    const dollars = Number(value);
    if (!Number.isFinite(dollars) || dollars <= 0) {
      toast.error("Enter a positive price");
      return;
    }
    const cents = Math.round(dollars * 100);
    startTransition(async () => {
      const res = await setTargetPrice(productId, cents);
      if (res.ok) {
        toast.success("Target price saved");
        setEditing(false);
        router.refresh();
      } else {
        toast.error(`Failed: ${res.error}`);
      }
    });
  }

  function clear() {
    startTransition(async () => {
      const res = await clearTargetPrice(productId);
      if (res.ok) {
        toast.success("Target cleared");
        setValue("");
        setEditing(false);
        router.refresh();
      } else {
        toast.error(`Failed: ${res.error}`);
      }
    });
  }

  if (!editing) {
    return (
      <Button
        variant="outline"
        onClick={() => setEditing(true)}
        className="gap-2"
      >
        <Target size={16} />
        {initialTargetCents != null
          ? `Target $${(initialTargetCents / 100).toFixed(2)}`
          : "Set target price"}
      </Button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex items-center gap-2"
    >
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          $
        </span>
        <Input
          type="number"
          step="0.01"
          min="0"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0.00"
          className="w-32 pl-6"
          disabled={isPending}
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save"}
      </Button>
      {initialTargetCents != null && (
        <Button
          type="button"
          variant="ghost"
          onClick={clear}
          disabled={isPending}
          className="gap-1"
        >
          <X size={14} /> Clear
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        onClick={() => setEditing(false)}
        disabled={isPending}
      >
        Cancel
      </Button>
    </form>
  );
}
