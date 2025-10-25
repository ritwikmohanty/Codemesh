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
  easy: {
    label: "Easy",
    color: "hsl(142, 71%, 45%)",
  },
  medium: {
    label: "Medium",
    color: "hsl(45, 93%, 47%)",
  },
  hard: {
    label: "Hard",
    color: "hsl(0, 84%, 60%)",
  },
  expert: {
    label: "Expert",
    color: "hsl(280, 60%, 40%)",
  },
} satisfies ChartConfig;

interface ProblemDistribution {
  easy: number;
  medium: number;
  hard: number;
  expert: number;
}

interface ProblemDistributionPieChartProps {
  distribution: ProblemDistribution;
}

export function ProblemDistributionPieChart({ distribution }: ProblemDistributionPieChartProps) {
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
    { difficulty: "easy", problems: distribution.easy, fill: chartConfig.easy.color },
    { difficulty: "medium", problems: distribution.medium, fill: chartConfig.medium.color },
    { difficulty: "hard", problems: distribution.hard, fill: chartConfig.hard.color },
    { difficulty: "expert", problems: distribution.expert, fill: chartConfig.expert.color },
  ].filter(item => item.problems > 0);

  const totalProblems = distribution.easy + distribution.medium + distribution.hard + distribution.expert;

  return (
    <Card ref={chartRef} className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-lg md:text-xl">
          Problem Distribution
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
                nameKey="difficulty"
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
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {chartData.map((item) => (
            <div key={item.difficulty} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-sm capitalize font-medium">
                {item.difficulty}
              </span>
              <span className="text-sm text-muted-foreground">
                ({item.problems})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
