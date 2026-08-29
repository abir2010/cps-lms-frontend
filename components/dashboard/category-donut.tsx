"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartTooltipProps } from "@/lib/chart-tooltip";

export interface CategoryDatum {
  name: string;
  value: number;
}

const palette = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function ChartTooltip({ active, payload }: ChartTooltipProps<CategoryDatum>) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground">{d.name}</p>
      <p className="text-muted-foreground">{payload[0].value}</p>
    </div>
  );
}

export function CategoryDonut({ title, subtitle, data }: { title: string; subtitle?: string; data: CategoryDatum[] }) {
  const withColor = data.map((d, i) => ({ ...d, fill: palette[i % palette.length] }));
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent className="flex h-56 flex-col items-center justify-center gap-4 sm:flex-row">
        <div className="h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={withColor}
                dataKey="value"
                nameKey="name"
                innerRadius={48}
                outerRadius={70}
                paddingAngle={3}
                cornerRadius={6}
                stroke="none"
              >
                {withColor.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2.5">
          {withColor.map((d) => (
            <div key={d.name} className="flex items-center gap-2.5 text-sm">
              <span className="size-2.5 rounded-full" style={{ background: d.fill }} />
              <span className="text-foreground">{d.name}</span>
              <span className="text-muted-foreground">
                {d.value}
                {total > 0 && ` (${Math.round((d.value / total) * 100)}%)`}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
