"use client";

import { Button } from "@/components/ui/button";
import {
  addProduct,
  getProductPreview,
  type ProductPreview,
} from "@/actions/productActions";
import { asinSchema, extractAsin } from "@/lib/asin";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, AlertCircle, Star } from "lucide-react";
import { formatPrice, hasPrice } from "@/lib/price";

const previewCache = new Map<string, ProductPreview>();

type PreviewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; data: ProductPreview }
  | { status: "error"; message: string };

export default function AddProductForm() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<PreviewState>({ status: "idle" });

  const debouncedInput = useDebouncedValue(input, 600);

  useEffect(() => {
    const trimmed = debouncedInput.trim();
    if (!trimmed) {
      setPreview({ status: "idle" });
      return;
    }

    const candidate = extractAsin(trimmed);
    const parsed = asinSchema.safeParse(candidate);
    if (!parsed.success) {
      setPreview({ status: "error", message: "Invalid ASIN format" });
      return;
    }
    const asin = parsed.data;

    const cached = previewCache.get(asin);
    if (cached) {
      setPreview({ status: "ready", data: cached });
      return;
    }

    let cancelled = false;
    setPreview({ status: "loading" });
    getProductPreview(asin).then((res) => {
      if (cancelled) return;
      if (!res.ok) {
        const msg =
          res.error === "quota_exceeded"
            ? "Amazon API quota exhausted — try again later"
            : res.error === "scraper_failed"
              ? "Couldn't load product details"
              : "Invalid ASIN";
        setPreview({ status: "error", message: msg });
        return;
      }
      if (res.data) {
        previewCache.set(asin, res.data);
        setPreview({ status: "ready", data: res.data });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [debouncedInput]);

  async function handleConfirm() {
    if (preview.status !== "ready") return;
    setSubmitting(true);
    const response = await addProduct(preview.data.asin);
    setSubmitting(false);

    if (response.ok) {
      toast.success("Product added!");
      router.push(`/product/${preview.data.asin}`);
      router.refresh();
      return;
    }

    if (response.error === "duplicate") {
      toast.info("Already tracking this product");
      router.push(`/product/${preview.data.asin}`);
      return;
    }

    if (response.error === "quota_exceeded") {
      toast.error("Amazon API quota exhausted — try again later");
      return;
    }

    if (response.error === "scraper_failed") {
      toast.error("Couldn't fetch product from Amazon");
      return;
    }

    if (response.error === "invalid_asin") {
      toast.error("Invalid ASIN");
      return;
    }

    toast.error("Something went wrong");
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm",
        "p-6 shadow-sm space-y-5"
      )}
    >
      <div className="space-y-2">
        <h1 className="text-lg font-semibold text-foreground">Track a product</h1>
        <p className="text-sm text-muted-foreground">
          Paste an Amazon URL or a 10-character ASIN. We&apos;ll preview it before tracking.
        </p>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="productId"
          className="text-[11px] uppercase tracking-wider text-muted-foreground"
        >
          ASIN or URL
        </label>
        <div
          className={cn(
            "group relative flex items-center rounded-lg border border-border/60 bg-card/60 backdrop-blur-sm",
            "transition-colors focus-within:border-primary/60 focus-within:bg-card/80",
            "focus-within:shadow-[0_0_24px_-12px_var(--primary)]"
          )}
        >
          <input
            id="productId"
            name="productId"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. B07ZPKBL9V or https://amazon.com/dp/..."
            autoComplete="off"
            className={cn(
              "h-10 w-full bg-transparent px-3 text-sm text-foreground",
              "placeholder:text-muted-foreground/70 focus:outline-none"
            )}
          />
        </div>
      </div>

      <PreviewBlock state={preview} />

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={preview.status !== "ready" || submitting}
          className={cn(
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
            "shadow-[0_0_24px_-12px_var(--primary)]"
          )}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              Adding…
            </>
          ) : (
            "Confirm & track"
          )}
        </Button>
      </div>
    </div>
  );
}

function PreviewBlock({ state }: { state: PreviewState }) {
  if (state.status === "idle") return null;

  if (state.status === "loading") {
    return (
      <div className="rounded-lg border border-border/60 bg-card/60 backdrop-blur-sm p-3 flex gap-3">
        <div className="h-20 w-20 shrink-0 rounded-md bg-muted animate-pulse" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-3.5 w-3/4 rounded bg-muted animate-pulse" />
          <div className="h-3.5 w-1/2 rounded bg-muted animate-pulse" />
          <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10",
          "px-3 py-2.5 text-sm text-destructive"
        )}
      >
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{state.message}</span>
      </div>
    );
  }

  const { data } = state;
  const rating = data.reviewsAverageRating / 10;
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border/60 bg-card",
        "border-l-4 border-l-primary",
        "p-3 flex gap-3"
      )}
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
        {data.img ? (
          <Image
            src={data.img}
            alt={data.title}
            fill
            sizes="80px"
            className="object-contain"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground line-clamp-2">
          {data.title}
        </p>
        <p
          className={cn(
            "mt-1 text-base font-semibold",
            hasPrice(data.price) ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {formatPrice(data.price)}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-primary text-primary" />
          <span>{rating.toFixed(1)}</span>
          <span aria-hidden>·</span>
          <span>{data.reviewsCount.toLocaleString()} reviews</span>
        </p>
      </div>
    </div>
  );
}
