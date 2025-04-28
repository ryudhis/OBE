"use client";

import { useState, useEffect } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Home } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type HistoryItem = {
  type: "cpl" | "cpmk";
  data: any[];
};

export default function CustomRadar({
  data,
}: {
  data: CalculatedPerformaCPL[];
}) {
  const initialData = data;
  const [currentData, setCurrentData] = useState<any[]>(initialData);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentTitle, setCurrentTitle] = useState("Semua CPL");
  const [currentLevel, setCurrentLevel] = useState<"CPL" | "CPMK" | "MK">(
    "CPL"
  );

  // Update currentData when the data prop changes
  useEffect(() => {
    setCurrentData(initialData);
    setCurrentTitle("Semua CPL");
    setCurrentLevel("CPL");
    setHistory([]);
  }, [initialData]);

  function parsePercentage(percentage: string): number {
    return Number.parseFloat(percentage.replace("%", ""));
  }

  function prepareChartData(items: any[]): any[] {
    return items.map((item) => ({
      ...item,
      value: parsePercentage(item.nilai),
    }));
  }

  function updateChart(
    items: any[],
    level: "CPL" | "CPMK" | "MK",
    title: string
  ) {
    setCurrentData(prepareChartData(items));
    setCurrentLevel(level);
    setCurrentTitle(title);
  }

  function showAllCPLs() {
    setHistory([]);
    updateChart(initialData, "CPL", "Semua CPL");
  }

  function showCPMKs(cpl: CalculatedPerformaCPL) {
    setHistory((prev) => [...prev, { type: "cpl", data: currentData }]);
    updateChart(cpl.CPMK, "CPMK", `CPMK untuk ${cpl.kode}`);
  }

  function showMKs(cpmk: CPMK) {
    setHistory((prev) => [...prev, { type: "cpmk", data: currentData }]);
    updateChart(cpmk.MK, "MK", `MK untuk ${cpmk.kode}`);
  }

  function goBack() {
    if (history.length === 0) return;
    const previous = history.pop()!;
    const isCPLLevel = history.length === 0 && previous.type === "cpl";

    updateChart(
      previous.data,
      previous.type === "cpl" ? "CPL" : "CPMK",
      isCPLLevel ? "Semua CPL" : currentTitle
    );
    setHistory([...history]);
  }

  function handleChartClick(data: any) {
    if (!data || !data.activePayload || data.activePayload.length === 0) return;
    const point = data.activePayload[0].payload;
    if (currentLevel === "CPL") {
      const cpl = initialData.find((d) => d.kode === point.kode);
      if (cpl) showCPMKs(cpl);
    } else if (currentLevel === "CPMK") {
      for (const cpl of initialData) {
        const cpmk = cpl.CPMK.find((d) => d.kode === point.kode);
        if (cpmk) showMKs(cpmk as unknown as CPMK);
      }
    }
  }

  const chartConfig = {
    value: { label: "Performa", color: "#6366f1" },
  } satisfies ChartConfig;

  return (
    <Card className="w-full">
      <CardContent>
        <div className="my-6 flex flex-col sm:flex-row justify-between items-center">
          <h2 className="font-medium">
            Sedang menampilkan:{" "}
            <span className="font-bold">{currentTitle}</span>
          </h2>
          <div className="flex gap-2">
            {history.length > 0 && (
              <Button onClick={goBack} variant="outline" size="sm">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            )}
            {(history.length > 0 || currentLevel !== "CPL") && (
              <Button onClick={showAllCPLs} variant="outline" size="sm">
                <Home className="mr-1 h-4 w-4" />
                Semua CPL
              </Button>
            )}
          </div>
        </div>

        <div className="h-[500px] w-full">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[500px]"
          >
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius="70%"
              data={currentData}
              onClick={handleChartClick}
            >
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="kode"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickLine={{ stroke: "#6b7280" }}
              />
              <Radar
                name="Value"
                dataKey="value"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.6}
                isAnimationActive
                dot={{ r: 4, fill: "#6366f1", className: "cursor-pointer" }}
                activeDot={{
                  r: 8,
                  stroke: "#4f46e5",
                  strokeWidth: 2,
                  fill: "#818cf8",
                  className: "cursor-pointer",
                }}
              />
            </RadarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
