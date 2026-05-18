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
import { CLUB_COLORS, CLUB_SHORT_NAMES } from "@/lib/constants";
import { EmptyState } from "@/components/EmptyState";

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
        message="No hay semanas suficientes para comparar clubes."
        title="Sin tendencia por club"
      />
    );
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-soft">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-ink-950">Tendencia por club</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Una línea por club en las últimas semanas.
        </p>
      </div>
      <div className="h-80">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={data} margin={{ bottom: 8, left: 0, right: 14, top: 12 }}>
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
            {clubKeys.map((club) => (
              <Line
                activeDot={{ r: 5 }}
                dataKey={club}
                dot={{ r: 2 }}
                key={club}
                name={CLUB_SHORT_NAMES[club] ?? club}
                stroke={CLUB_COLORS[club] ?? "#111827"}
                strokeWidth={3}
                type="monotone"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
