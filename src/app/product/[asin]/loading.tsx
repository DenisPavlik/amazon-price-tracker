import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="col-span-12 md:col-span-9 p-4 flex flex-col gap-6">
      <Skeleton className="h-8 w-32" />
      <div className="rounded-2xl border border-border/60 bg-card/70 p-6 flex gap-5">
        <Skeleton className="size-32 md:size-40 rounded-xl" />
        <div className="flex-1 flex flex-col gap-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-40" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}
