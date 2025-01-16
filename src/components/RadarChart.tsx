"use client";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  percentage: {
    label: "Performa: ",
    color: "#1976D2",
  },
} satisfies ChartConfig;

interface RadarChartComponentProps {
  data: { subject: string; percentage: number }[];
}

export function RadarChartComponent({ data }: RadarChartComponentProps) {
  return (
    <div className="mx-auto mb-4 flex w-fit flex-col items-center">
      <ChartContainer
        config={chartConfig}
        className="mx-auto -mb-10 aspect-square max-h-40 w-full sm:max-h-52 md:max-h-44 lg:-mb-2 lg:max-h-72"
      >
        <RadarChart data={data}>
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <PolarAngleAxis dataKey="subject" />
          <PolarGrid />
          <Radar
            dataKey="percentage"
            fill="var(--color-percentage)"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ChartContainer>
      <div className="xs:px-2 flex items-center gap-2 px-4 text-xs leading-none text-muted-foreground sm:px-5 md:px-4 lg:text-base">
        {data.map((item, index) => (
          <span key={index}>
            {item.subject}: {item.percentage} {index < data.length - 1 && "| "}
          </span>
        ))}
      </div>
    </div>
  );
}
