"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartTooltipProps } from "@/lib/chart-tooltip";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface CourseBarDatum {
  course: string;
  value: number;
}

function ChartTooltip({ active, payload }: ChartTooltipProps<CourseBarDatum>) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground">{d.course}</p>
      <p className="text-muted-foreground">{d.value}%</p>
    </div>
  );
}

export function CourseBarChart({
  title,
  subtitle,
  data,
}: {
  title: string;
  subtitle?: string;
  data: CourseBarDatum[];
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent className="h-72 pr-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} stroke="var(--border)" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              unit="%"
            />
            <YAxis
              type="category"
              dataKey="course"
              tickLine={false}
              axisLine={false}
              width={140}
              tick={{ fill: "var(--foreground)", fontSize: 12.5 }}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "var(--muted)" }}
            />
            <Bar
              dataKey="value"
              fill="var(--chart-1)"
              radius={[0, 6, 6, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
