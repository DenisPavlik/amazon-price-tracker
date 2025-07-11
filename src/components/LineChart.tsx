"use client";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, XAxis } from "recharts";

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
  color = "var(--chart-5)",
  trend = 'orange',
}: {
  data?: {
    x: string;
    [key: string]: number | string;
  }[];
  label?: string;
  color?: string;
  trend?: string;
}) {
  const chartConfig = {
    desktop: {
      label,
      color,
    },
  } satisfies ChartConfig;
  return (
    <div className="w-full h-24 -my-2">
      {data.length > 1 ? (
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <XAxis
              dataKey="x"
              tick={false}
              axisLine={false}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("uk-UA", {
                  day: "2-digit",
                  month: "short",
                })
              }
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id={`fill-${trend}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            {Object.keys(data[0])
              .filter((k) => k !== "x")
              .map((k, index) => (
                <Area
                  key={index}
                  dataKey={k}
                  type="linear"
                  fill={`url(#fill-${trend})`}
                  fillOpacity={0.4}
                  stroke={color}
                  stackId="a"
                />
              ))}
          </AreaChart>
        </ChartContainer>
      ) : (
        <div className="text-sm text-gray-400 text-center">
          No price history yet
        </div>
      )}
    </div>
  );
}
