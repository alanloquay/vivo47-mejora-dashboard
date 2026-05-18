"use client";

import { Info } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ClubParticipationItem } from "@/lib/metrics";
import { formatNumber, formatPercent } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";

export function CountryCompliancePie({ item }: { item?: ClubParticipationItem }) {
  if (!item) {
    return (
      <EmptyState
        message="No hay países configurados para esta vista."
        title="Cumplimiento de países"
      />
    );
  }

  const value = Math.min(item.countryCompliance, 1);
  const data = [
    { name: "Países activos", value: item.activeTeams },
    { name: "Pendientes", value: Math.max(item.totalTeams - item.activeTeams, 0) }
  ];

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-ink-950">Cumplimiento de países</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Última semana completa: {item.lastCompletedWeekLabel}
          </p>
        </div>
        <div className="group relative">
          <button
            aria-label="Cómo se mide"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600"
            type="button"
          >
            <Info aria-hidden className="h-4 w-4" />
          </button>
          <div className="pointer-events-none absolute right-0 top-11 z-10 hidden w-72 rounded-lg border border-neutral-200 bg-white p-3 text-sm text-neutral-600 shadow-soft group-hover:block">
            Mide cuántos países del club subieron al menos una mejora durante la última
            semana completa. No mide la cantidad total de mejoras.
          </div>
        </div>
      </div>
      <div className="grid items-center gap-4 sm:grid-cols-[1fr_1.15fr]">
        <div className="h-56">
          <ResponsiveContainer height="100%" width="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                endAngle={-270}
                innerRadius={64}
                outerRadius={88}
                paddingAngle={2}
                startAngle={90}
              >
                <Cell fill={item.color} />
                <Cell fill="#e5e7eb" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <img alt="" className="mb-4 h-14 w-14 object-contain" src={item.logo} />
          <p className="text-5xl font-semibold text-ink-950">{formatPercent(value)}</p>
          <p className="mt-2 text-lg font-semibold text-ink-950">
            {formatNumber(item.activeTeams)} / {formatNumber(item.totalTeams)} países
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            Participaron con al menos una mejora registrada.
          </p>
        </div>
      </div>
    </section>
  );
}
