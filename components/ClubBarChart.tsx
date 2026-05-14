"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { ClubTotal } from "@/lib/metrics";
import { EmptyState } from "@/components/EmptyState";

export function ClubBarChart({ data }: { data: ClubTotal[] }) {
  if (!data.length) {
    return (
      <EmptyState
        message="No hay mejoras para comparar por club."
        title="Sin datos por club"
      />
    );
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-soft">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-ink-950">Mejoras por club</h2>
        <p className="mt-1 text-sm text-neutral-500">Participación acumulada.</p>
      </div>
      <div className="h-80">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 12, right: 20 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" horizontal={false} />
            <XAxis allowDecimals={false} tick={{ fill: "#6b7280", fontSize: 12 }} type="number" />
            <YAxis
              dataKey="club"
              tick={{ fill: "#374151", fontSize: 12 }}
              tickLine={false}
              type="category"
              width={118}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                boxShadow: "0 14px 35px rgba(0,0,0,0.1)"
              }}
            />
            <Bar dataKey="count" fill="#12b96a" name="Mejoras" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
