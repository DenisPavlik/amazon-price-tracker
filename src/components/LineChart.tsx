"use client";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
// import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

export default function LineChart({
  data = [
    { x: "January", price: 42 },
    { x: "February", price: 48 },
    { x: "March", price: 56 },
    { x: "April", price: 52 },
    { x: "May", price: 74 },
    { x: "June", price: 112 },
  ],
  label = "Price",
  color = "var(--chart-1)",
}: {
  data?: {
    x: string;
    [key: string]: number | string;
  }[];
  label?: string;
  color?: string;
}) {
  const chartConfig = {
    desktop: {
      label,
      color,
    },
  } satisfies ChartConfig;
  return (
    <div className="w-full -my-2">
      <ChartContainer config={chartConfig}>
        <AreaChart
          accessibilityLayer
          data={data}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          {/* <CartesianGrid vertical={false} /> */}
          <XAxis
            dataKey="x"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <defs>
            <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-desktop)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-desktop)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          {Object.keys(data[0])
            .filter((k) => k !== "x")
            .map((k, index) => (
              <Area
                key={index}
                dataKey={k}
                type="natural"
                fill="url(#fillDesktop)"
                fillOpacity={0.4}
                stroke="var(--color-desktop)"
                stackId="a"
              />
            ))}
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
