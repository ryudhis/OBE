"use client";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  percentage: {
    label: "Persentase: ",
    color: "#1976D2",
  },
  label: {
    color: "hsl(var(--background))",
  },
} satisfies ChartConfig;

// Define the props interface
interface ComponentProps {
  data: { subject: string; percentage: number }[];
  tipe: string;
  title?: string;
}

export function BarChartComponent({ data, tipe, title }: ComponentProps) {
  return (
    <div className="w-[600px]">
      <Card>
        <CardHeader>
          <CardTitle>{title ? title : "Grafik Persentase Lulus"}</CardTitle>
          <CardDescription>{tipe}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={data}
              layout="vertical"
              margin={{
                right: 16,
              }}
            >
              <YAxis
                dataKey="subject"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
                hide
              />
              <XAxis type="number" domain={[0, 100]} hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar
                dataKey="percentage"
                layout="vertical"
                fill="var(--color-percentage)"
                radius={4}
              >
                <LabelList
                  dataKey="subject"
                  position="insideLeft"
                  offset={8}
                  className="fill-[--color-label]"
                  fontSize={12}
                />
                <LabelList
                  dataKey="percentage"
                  position="insideRight"
                  offset={8}
                  className="fill-[--color-label]"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
