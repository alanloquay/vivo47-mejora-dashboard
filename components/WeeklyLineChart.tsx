"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { WeeklyPoint } from "@/lib/metrics";
import { EmptyState } from "@/components/EmptyState";

export function WeeklyLineChart({
  data,
  title = "Mejoras por semana",
  subtitle = "Avance semanal contra meta.",
  color = "#12b96a"
}: {
  data: WeeklyPoint[];
  title?: string;
  subtitle?: string;
  color?: string;
}) {
  if (!data.length) {
    return (
      <EmptyState
        message="Ajusta los filtros o revisa la fuente de datos."
        title="Sin tendencia semanal"
      />
    );
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-soft">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-ink-950">{title}</h2>
        <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
      </div>
      <div className="h-80">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={data} margin={{ bottom: 8, left: 0, right: 12, top: 12 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="weekLabel"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              tickLine={false}
            />
            <YAxis allowDecimals={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                boxShadow: "0 14px 35px rgba(0,0,0,0.1)"
              }}
            />
            <Legend />
            <Line
              dataKey="count"
              dot={{ r: 3 }}
              name="Mejoras"
              stroke={color}
              strokeWidth={3}
              type="monotone"
            />
            <Line
              dataKey="goal"
              dot={false}
              name="Meta"
              stroke="#111827"
              strokeDasharray="6 6"
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
