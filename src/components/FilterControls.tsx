"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, XIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const SORT_OPTIONS = [
  { value: "newest", label: "Date added (newest)" },
  { value: "oldest", label: "Date added (oldest)" },
  { value: "drop", label: "Biggest drop %" },
  { value: "price-asc", label: "Price (low → high)" },
  { value: "price-desc", label: "Price (high → low)" },
  { value: "rating", label: "Rating" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

const isSort = (v: string | null): v is SortValue =>
  !!v && SORT_OPTIONS.some((o) => o.value === v);

export default function FilterControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSort = searchParams.get("sort");
  const urlQ = searchParams.get("q") ?? "";

  const sort: SortValue = isSort(urlSort) ? urlSort : "newest";
  const [q, setQ] = useState(urlQ);
  const debouncedQ = useDebouncedValue(q, 300);

  useEffect(() => {
    setQ(urlQ);
  }, [urlQ]);

  const writeParams = (next: { sort?: string; q?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next.sort !== undefined) {
      if (next.sort && next.sort !== "newest") params.set("sort", next.sort);
      else params.delete("sort");
    }
    if (next.q !== undefined) {
      if (next.q.trim()) params.set("q", next.q.trim());
      else params.delete("q");
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  useEffect(() => {
    if (debouncedQ === urlQ) return;
    writeParams({ q: debouncedQ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  const reset = () => {
    setQ("");
    router.replace(pathname);
  };

  const isFiltered = sort !== "newest" || q.trim().length > 0;

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          "group relative flex items-center rounded-lg border border-border/60 bg-card/60 backdrop-blur-sm",
          "transition-colors focus-within:border-primary/60 focus-within:bg-card/80",
          "focus-within:shadow-[0_0_24px_-12px_var(--primary)]"
        )}
      >
        <SearchIcon
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title…"
          className="h-9 w-full bg-transparent pl-8 pr-8 text-sm placeholder:text-muted-foreground/70 focus:outline-none"
        />
        {q && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQ("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <XIcon size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Sort by
        </span>
        <Select
          value={sort}
          onValueChange={(value) => writeParams({ sort: value })}
        >
          <SelectTrigger
            size="sm"
            className={cn(
              "w-full bg-card/60 backdrop-blur-sm border-border/60",
              "hover:bg-card/80 hover:border-primary/40",
              "focus-visible:border-primary/60 focus-visible:ring-primary/20",
              "data-[state=open]:border-primary/60 data-[state=open]:shadow-[0_0_24px_-12px_var(--primary)]"
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card/95 backdrop-blur-sm border-border/60">
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isFiltered && (
        <button
          type="button"
          onClick={reset}
          className="text-xs text-muted-foreground hover:text-foreground self-start underline-offset-4 hover:underline transition-colors"
        >
          Reset filters
        </button>
      )}
    </div>
  );
}
