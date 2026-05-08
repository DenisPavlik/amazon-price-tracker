"use client";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LoginView() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <BackgroundAurora />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1280px] flex-col items-center justify-center gap-12 px-6 py-16 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:py-20">
        <section className="flex max-w-xl flex-col gap-8">
          <BrandMark />

          <div className="flex flex-col gap-5">
            <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Never miss a{" "}
              <span className="text-brand-gradient">price drop</span> on
              Amazon again.
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Track any product by ASIN, watch its price history at a glance,
              and get notified the moment it drops. Built for serious deal
              hunters.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              onClick={() => signIn("google")}
              className="group relative h-12 cursor-pointer gap-3 px-6 text-base font-medium shadow-[0_8px_30px_-12px_oklch(0.78_0.19_62/0.5)] transition-all hover:shadow-[0_12px_40px_-8px_oklch(0.78_0.19_62/0.65)]"
            >
              <GoogleIcon />
              Continue with Google
            </Button>
            <span className="text-xs text-muted-foreground">
              Free · No credit card
            </span>
          </div>

          <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {[
              "Daily price snapshots",
              "Drop notifications",
              "Unlimited products",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block size-1.5 rounded-full bg-primary shadow-[0_0_10px_oklch(0.78_0.19_62/0.8)]"
                />
                {f}
              </li>
            ))}
          </ul>
        </section>

        <section className="w-full max-w-md lg:max-w-[440px]">
          <ProductCardMockup />
        </section>
      </div>
    </main>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF9900] to-[#FF6600] shadow-[0_8px_24px_-8px_oklch(0.78_0.19_62/0.6)]">
        <svg
          viewBox="0 0 24 24"
          className="size-5 text-[oklch(0.16_0.012_60)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 17l5-5 4 4 8-9" />
          <path d="M14 7h6v6" />
        </svg>
      </span>
      <span className="font-display text-lg font-semibold tracking-tight">
        Amz<span className="text-brand-gradient">Pulse</span>
      </span>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="#FFC107"
        d="M21.8 12.23c0-.78-.07-1.53-.2-2.25H12v4.26h5.5a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.04-4.4 3.04-7.65z"
      />
      <path
        fill="#FF3D00"
        d="M6.51 14.3l-.74.57-2.6 2.02A9.99 9.99 0 0 0 12 22c2.7 0 4.96-.9 6.62-2.42l-3.3-2.56c-.9.6-2.04.96-3.32.96-2.55 0-4.72-1.72-5.49-4.04z"
      />
      <path
        fill="#4CAF50"
        d="M3.17 7.1A9.99 9.99 0 0 0 2 12c0 1.6.38 3.12 1.06 4.46l3.45-2.68A6.01 6.01 0 0 1 6.18 12c0-.62.1-1.22.27-1.78L3.17 7.1z"
      />
      <path
        fill="#1976D2"
        d="M12 6.04c1.47 0 2.78.5 3.81 1.5l2.84-2.84A9.97 9.97 0 0 0 12 2 9.99 9.99 0 0 0 3.17 7.1l3.34 2.6C7.27 7.5 9.45 6.04 12 6.04z"
      />
    </svg>
  );
}

function ProductCardMockup() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[#FF9900]/40 via-transparent to-[#FF6600]/30 opacity-70 blur-[2px]"
      />
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/80 p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-secondary to-muted ring-1 ring-border/60">
            <svg
              viewBox="0 0 64 64"
              className="size-12 text-primary/80"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <rect x="14" y="18" width="36" height="32" rx="3" />
              <path d="M22 18v-4a10 10 0 0 1 20 0v4" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-primary/10" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Electronics · ASIN B0C7K9
            </p>
            <h3 className="mt-1 truncate font-display text-base font-semibold leading-snug">
              Sony WH-1000XM5 Wireless Headphones
            </h3>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-amber-400 text-sm">★★★★★</span>
              <span className="text-xs text-muted-foreground">
                4.8 · 12,340 reviews
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Current price</p>
            <p className="font-display text-3xl font-semibold tracking-tight">
              $328<span className="text-xl text-muted-foreground">.00</span>
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-[oklch(0.78_0.19_152/0.3)] bg-[oklch(0.78_0.19_152/0.12)] px-2.5 py-1 text-xs font-medium text-[oklch(0.85_0.18_152)]">
            <svg viewBox="0 0 12 12" className="size-3" fill="currentColor" aria-hidden>
              <path d="M6 9L1 4h10z" />
            </svg>
            18%
          </span>
        </div>

        <MiniChart />

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/60 pt-4 text-center">
          <Stat label="30d low" value="$319" />
          <Stat label="30d avg" value="$362" />
          <Stat label="30d high" value="$399" />
        </div>
      </div>

      <div
        aria-hidden
        className="absolute -right-3 -top-3 hidden rounded-xl border border-border/80 bg-card/90 px-3 py-2 text-xs shadow-xl backdrop-blur-md sm:flex sm:items-center sm:gap-2"
      >
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
        <span className="text-foreground/90">Price drop detected</span>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-display text-sm font-semibold">{value}</p>
    </div>
  );
}

function MiniChart() {
  const data = [78, 74, 80, 72, 68, 71, 65, 60, 62, 55, 58, 50, 47, 52, 44, 40, 42, 36, 33];
  const w = 360;
  const h = 96;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const stepX = w / (data.length - 1);
  const norm = (v: number) => h - 8 - ((v - min) / (max - min)) * (h - 16);

  const points = data.map((v, i) => `${i * stepX},${norm(v)}`);
  const linePath = `M ${points.join(" L ")}`;
  const areaPath = `${linePath} L ${w},${h} L 0,${h} Z`;
  const lastX = (data.length - 1) * stepX;
  const lastY = norm(data[data.length - 1]);

  return (
    <div className="mt-5">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-24 w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF9900" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FF6600" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="priceStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF9900" />
            <stop offset="100%" stopColor="#FF6600" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1="0"
            x2={w}
            y1={h * t}
            y2={h * t}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeDasharray="2 4"
          />
        ))}

        <path d={areaPath} fill="url(#priceFill)" />
        <path
          d={linePath}
          fill="none"
          stroke="url(#priceStroke)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle cx={lastX} cy={lastY} r="8" fill="#FF9900" fillOpacity="0.18" />
        <circle cx={lastX} cy={lastY} r="3.5" fill="#FF9900" />
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>30d ago</span>
        <span>14d</span>
        <span>7d</span>
        <span>Today</span>
      </div>
    </div>
  );
}

function BackgroundAurora() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-32 -top-32 size-[520px] rounded-full bg-[radial-gradient(closest-side,rgb(255_153_0/0.22),transparent_70%)] blur-2xl" />
      <div className="absolute -right-24 top-1/3 size-[460px] rounded-full bg-[radial-gradient(closest-side,rgb(255_102_0/0.18),transparent_70%)] blur-2xl" />
      <div className="absolute bottom-[-180px] left-1/3 size-[600px] rounded-full bg-[radial-gradient(closest-side,rgb(255_153_0/0.10),transparent_70%)] blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}
