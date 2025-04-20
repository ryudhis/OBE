"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Home } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Raw JSON data

// Types
interface MK {
  kode: string;
  nilai: string;
  value?: number;
}

interface CPMK {
  kode: string;
  nilai: string;
  value?: number;
  MK: MK[];
}

interface CPL {
  kode: string;
  nilai: string;
  value?: number;
  CPMK: CPMK[];
}

type HistoryItem = {
  type: "cpl" | "cpmk";
  data: any[];
};

// Transform raw data
function calculateChartData(raw: any[]): CPL[] {
  return raw.map((cpl) => {
    const CPMK = cpl.CPMK.map((cpmk) => {
      const totalNilai = cpmk.lulusMK_CPMK.reduce(
        (acc, mk) => acc + mk.jumlahLulus,
        0
      );
      const countMK = cpmk.lulusMK_CPMK.length;
      const mkValue = countMK ? totalNilai / countMK : 0;

      return {
        kode: cpmk.kode.trim(),
        nilai: `${mkValue.toFixed(2)}%`,
        MK: cpmk.lulusMK_CPMK.map((mk) => ({
          kode: mk.MKId,
          nilai: `${mk.jumlahLulus}%`,
        })),
      };
    });

    const totalCPMK = CPMK.reduce(
      (acc, cpmk) => acc + parseFloat(cpmk.nilai),
      0
    );
    const countCPMK = CPMK.length;
    const cplValue = countCPMK ? totalCPMK / countCPMK : 0;

    return {
      kode: cpl.kode.trim(),
      nilai: `${cplValue.toFixed(2)}%`,
      CPMK,
    };
  });
}

export default function CustomRadar({data}: { data: PerformaCPL[] }) {
  const initialData: CPL[] = calculateChartData(data);
  const [currentData, setCurrentData] = useState<any[]>(initialData);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentTitle, setCurrentTitle] = useState("All CPLs");
  const [currentLevel, setCurrentLevel] = useState<"CPL" | "CPMK" | "MK">(
    "CPL"
  );

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
    updateChart(initialData, "CPL", "All CPLs");
  }

  function showCPMKs(cpl: CPL) {
    setHistory((prev) => [...prev, { type: "cpl", data: currentData }]);
    updateChart(cpl.CPMK, "CPMK", `CPMKs for ${cpl.kode}`);
  }

  function showMKs(cpmk: CPMK) {
    setHistory((prev) => [...prev, { type: "cpmk", data: currentData }]);
    updateChart(cpmk.MK, "MK", `MKs for ${cpmk.kode}`);
  }

  function goBack() {
    if (history.length === 0) return;
    const previous = history.pop()!;
    updateChart(
      previous.data,
      previous.type === "cpl" ? "CPL" : "CPMK",
      currentTitle
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
        if (cpmk) showMKs(cpmk);
      }
    }
  }

  const chartConfig = {
    value: { label: "Performa", color: "#6366f1" },
  } satisfies ChartConfig;

  return (
    <Card className="w-full">
      <CardContent>
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">
              Click on a {currentLevel} to{" "}
              {currentLevel === "MK" ? "view details" : "see its components"}
            </p>
            <p className="font-medium">Currently showing: {currentTitle}</p>
          </div>
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
                All CPLs
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
              outerRadius="80%"
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
