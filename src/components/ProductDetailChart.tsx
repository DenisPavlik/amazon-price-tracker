"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, Brush, CartesianGrid, XAxis, YAxis } from "recharts";

type Point = { x: string; price: number };

export default function ProductDetailChart({
  data,
  trend = "orange",
}: {
  data: Point[];
  trend?: "green" | "red" | "orange";
}) {
  const color =
    trend === "green"
      ? "var(--chart-green)"
      : trend === "red"
        ? "var(--chart-red)"
        : "var(--chart-orange)";

  const chartConfig = {
    price: { label: "Price", color },
  } satisfies ChartConfig;

  if (data.length < 2) {
    return (
      <div className="h-72 grid place-items-center rounded-xl border border-border/60 bg-card/60 text-sm text-muted-foreground">
        Not enough price history yet — check back tomorrow.
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-72 w-full">
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{ top: 12, right: 16, left: 8, bottom: 8 }}
      >
        <defs>
          <linearGradient id={`fill-detail-${trend}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.55} />
            <stop offset="95%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.25} />
        <XAxis
          dataKey="x"
          tickLine={false}
          axisLine={false}
          minTickGap={32}
          tickMargin={8}
          tickFormatter={(value) =>
            new Date(value).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
            })
          }
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(v: number) => `$${v.toFixed(0)}`}
        />
        <ChartTooltip
          cursor={{ stroke: color, strokeOpacity: 0.4 }}
          content={
            <ChartTooltipContent
              labelFormatter={(value) =>
                new Date(value as string).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              }
              formatter={(value) => [`$${(value as number).toFixed(2)}`, "Price"]}
            />
          }
        />
        <Area
          dataKey="price"
          type="monotone"
          stroke={color}
          strokeWidth={2}
          fill={`url(#fill-detail-${trend})`}
        />
        <Brush
          dataKey="x"
          height={24}
          travellerWidth={10}
          stroke={color}
          fill="var(--card)"
          tickFormatter={(value) =>
            new Date(value).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
            })
          }
        />
      </AreaChart>
    </ChartContainer>
  );
}
