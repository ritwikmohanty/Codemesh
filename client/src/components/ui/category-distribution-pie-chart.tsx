"use client";

import { useState, useEffect, useRef } from "react";
import { LabelList, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
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
  problems: {
    label: "Problems",
  },
  CP: {
    label: "Competitive Programming",
    color: "hsl(var(--primary))",
  },
  DSA: {
    label: "Data Structures & Algorithms",
    color: "hsl(var(--secondary))",
  },
  Fundamentals: {
    label: "Fundamentals",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

interface CategoryDistribution {
  CP: number;
  DSA: number;
  Fundamentals: number;
}

interface CategoryDistributionPieChartProps {
  distribution: CategoryDistribution;
}

export function CategoryDistributionPieChart({ distribution }: CategoryDistributionPieChartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const chartData = [
    { category: "CP", problems: distribution.CP, fill: "var(--color-CP)" },
    { category: "DSA", problems: distribution.DSA, fill: "var(--color-DSA)" },
    { category: "Fundamentals", problems: distribution.Fundamentals, fill: "var(--color-Fundamentals)" },
  ].filter(item => item.problems > 0);

  const totalProblems = distribution.CP + distribution.DSA + distribution.Fundamentals;

  return (
    <Card ref={chartRef} className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-lg md:text-xl">
          Categories
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Total: {totalProblems} problems
        </p>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        {isVisible ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="problems" hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="problems"
                nameKey="category"
                innerRadius={30}
                radius={10}
                cornerRadius={8}
                paddingAngle={4}
                animationBegin={0}
                animationDuration={800}
              >
                <LabelList
                  dataKey="problems"
                  stroke="none"
                  fontSize={12}
                  fontWeight={500}
                  fill="white"
                  formatter={(value: number) => value.toString()}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="mx-auto aspect-square max-h-[250px] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        )}
        
        {/* Legend */}
        <div className="flex flex-col gap-3 mt-4">
          {chartData.map((item) => (
            <div key={item.category} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: chartConfig[item.category as keyof typeof chartConfig].color }}
                />
                <span className="text-sm font-medium">
                  {chartConfig[item.category as keyof typeof chartConfig].label}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {item.problems}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
