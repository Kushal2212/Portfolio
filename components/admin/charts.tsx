"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const axisStyle = { fontSize: 10, fill: "var(--muted-foreground)" };

function ChartTooltip() {
  return (
    <Tooltip
      cursor={{ stroke: "var(--border)", strokeDasharray: "3 3" }}
      contentStyle={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        fontSize: 11,
        color: "var(--foreground)",
        boxShadow: "0 12px 40px -18px rgba(0,0,0,0.35)",
      }}
      labelStyle={{ color: "var(--muted-foreground)", fontSize: 10, marginBottom: 4 }}
    />
  );
}

export function VisitorsAreaChart({
  data,
  height = 260,
}: {
  data: { date: string; views: number; visitors: number }[];
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
          <defs>
            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8a9a74" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#8a9a74" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7b96a8" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#7b96a8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={axisStyle} interval="preserveStartEnd" minTickGap={24} />
          <YAxis tickLine={false} axisLine={false} tick={axisStyle} allowDecimals={false} width={44} />
          <ChartTooltip />
          <Area type="monotone" dataKey="views" stroke="#6f8354" strokeWidth={2} fill="url(#viewsGradient)" />
          <Area type="monotone" dataKey="visitors" stroke="#7b96a8" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#visitorsGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopPagesBarChart({
  data,
  height = 220,
}: {
  data: { name: string; value: number }[];
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 6, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 4" />
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={108}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          />
          <ChartTooltip />
          <Bar dataKey="value" fill="#8a9a74" radius={[0, 5, 5, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const pieColors = ["#8a9a74", "#9b8fb8", "#7b96a8", "#c9a27a", "#c08a8d"];

export function BreakdownPieChart({
  data,
  height = 200,
}: {
  data: { name: string; value: number }[];
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="58%"
            outerRadius="82%"
            paddingAngle={3}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
            ))}
          </Pie>
          <ChartTooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MiniSparkline({ data }: { data: { views: number }[] }) {
  return (
    <div style={{ width: "100%", height: 44 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8a9a74" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#8a9a74" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="views" stroke="#6f8354" strokeWidth={1.5} fill="url(#spark)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChartLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="size-2 rounded-full" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
