"use client";

import { RadialBar, RadialBarChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartTooltipProps } from "@/lib/chart-tooltip";

export interface ProgressDatum {
  name: string;
  progress: number;
}

const palette = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function RingTooltip({ active, payload }: ChartTooltipProps<ProgressDatum>) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload;
  if (!entry) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground">{entry.name}</p>
      <p className="text-muted-foreground">{entry.progress}% complete</p>
    </div>
  );
}

export function ProgressOverview({ data }: { data: ProgressDatum[] }) {
  const withColor = data.map((d, i) => ({ ...d, fill: palette[i % palette.length] }));
  const average = data.length
    ? Math.round(data.reduce((s, d) => s + d.progress, 0) / data.length)
    : 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Course completion</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          {average}% average across {data.length} active course{data.length === 1 ? "" : "s"}
        </p>
      </CardHeader>
      <CardContent className="relative h-56">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            data={withColor}
            innerRadius="30%"
            outerRadius="100%"
            barSize={11}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar dataKey="progress" background={{ fill: "var(--muted)" }} cornerRadius={8} />
            <Tooltip content={<RingTooltip />} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{average}%</span>
          <span className="text-xs text-muted-foreground">average</span>
        </div>
      </CardContent>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-6 pb-5">
        {withColor.map((d) => (
          <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-full" style={{ background: d.fill }} />
            {d.name}
          </span>
        ))}
      </div>
    </Card>
  );
}
