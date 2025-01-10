"use client";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";

import { Card } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  percentage: {
    label: "Percentage",
    color: "#1976D2",
  },
} satisfies ChartConfig;

interface BarChartComponentProps {
  data: { subject: string; percentage: number }[];
}

export function BarChartComponent({ data }: BarChartComponentProps) {
  return (
    <ChartContainer
      className="mx-auto -mb-64 mt-10 flex items-center justify-center"
      config={chartConfig}
    >
      <ResponsiveContainer className="max-h-[60%] " width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            className="text-2xl font-semibold"
            dataKey="subject"
            type="category"
            tickLine={false}
            axisLine={false}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar
            dataKey="percentage"
            fill="var(--color-percentage)"
            radius={[0, 5, 5, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
