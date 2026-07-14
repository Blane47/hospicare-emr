"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type VitalsPoint = {
  date: string;
  systolic: number | null;
  diastolic: number | null;
  weight: number | null;
  temp: number | null;
};

const axis = {
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 11, fill: "var(--muted-foreground)" },
} as const;

const tip = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    fontSize: 12,
  },
} as const;

function Mini({
  title,
  data,
  lines,
}: {
  title: string;
  data: VitalsPoint[];
  lines: { key: keyof VitalsPoint; color: string; name: string }[];
}) {
  return (
    <div>
      <div className="text-muted-foreground mb-2 text-xs font-medium">{title}</div>
      <ResponsiveContainer width="100%" height={170}>
        <LineChart data={data} margin={{ top: 6, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis dataKey="date" {...axis} />
          <YAxis {...axis} width={34} domain={["auto", "auto"]} />
          <Tooltip {...tip} />
          {lines.map((l) => (
            <Line
              key={l.key as string}
              type="monotone"
              dataKey={l.key as string}
              name={l.name}
              stroke={l.color}
              strokeWidth={2}
              dot={{ r: 2 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VitalsTrends({ data }: { data: VitalsPoint[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      <Mini
        title="Blood pressure (mmHg)"
        data={data}
        lines={[
          { key: "systolic", color: "var(--chart-2)", name: "Systolic" },
          { key: "diastolic", color: "var(--chart-1)", name: "Diastolic" },
        ]}
      />
      <Mini
        title="Weight (kg)"
        data={data}
        lines={[{ key: "weight", color: "var(--chart-4)", name: "Weight" }]}
      />
      <Mini
        title="Temperature (°C)"
        data={data}
        lines={[{ key: "temp", color: "var(--chart-3)", name: "Temp" }]}
      />
    </div>
  );
}
