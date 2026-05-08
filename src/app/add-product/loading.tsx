import { Skeleton } from "@/components/ui/skeleton";

export default function AddProductLoading() {
  return (
    <div className="col-span-12 md:col-span-9">
      <div className="max-w-md mx-auto rounded-2xl border border-border/60 bg-card/70 p-6">
        <Skeleton className="h-5 w-32 mx-auto mb-4" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full mt-2" />
        </div>
      </div>
    </div>
  );
}
