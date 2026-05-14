"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { CLUB_COLORS } from "@/lib/constants";
import { EmptyState } from "@/components/EmptyState";

const FALLBACK_COLORS = ["#12b96a", "#087746", "#0a5e3a", "#4b5563", "#111827"];

export function ClubWeekChart({
  data,
  clubKeys
}: {
  data: Array<Record<string, string | number>>;
  clubKeys: string[];
}) {
  if (!data.length || !clubKeys.length) {
    return (
      <EmptyState
        message="No hay semanas suficientes para agrupar por club."
        title="Sin datos semanales por club"
      />
    );
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-soft">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-ink-950">Club por semana</h2>
        <p className="mt-1 text-sm text-neutral-500">Distribución semanal por sucursal.</p>
      </div>
      <div className="h-80">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={data} margin={{ bottom: 8, left: 0, right: 12, top: 12 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="weekLabel" tick={{ fill: "#6b7280", fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                boxShadow: "0 14px 35px rgba(0,0,0,0.1)"
              }}
            />
            <Legend />
            {clubKeys.map((club, index) => (
              <Bar
                dataKey={club}
                fill={CLUB_COLORS[club] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                key={club}
                name={club}
                radius={[6, 6, 0, 0]}
                stackId="club"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
