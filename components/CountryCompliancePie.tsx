"use client";

import { Info } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ClubParticipationItem } from "@/lib/metrics";
import { formatNumber, formatPercent } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";

type DonutMetric = {
  active: number;
  color: string;
  label: string;
  percent: number;
  subtitle: string;
  total: number;
};

function ComplianceDonut({ metric }: { metric: DonutMetric }) {
  const value = Math.min(metric.percent, 1);
  const data = metric.total
    ? [
        { name: "Cumplieron", value: metric.active },
        { name: "Pendientes", value: Math.max(metric.total - metric.active, 0) }
      ]
    : [{ name: "Sin países configurados", value: 1 }];

  return (
    <div className="grid items-center gap-5 lg:grid-cols-[220px_1fr]">
      <div className="h-60 min-w-0">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              endAngle={450}
              innerRadius={68}
              outerRadius={96}
              startAngle={90}
            >
              <Cell fill={metric.total ? metric.color : "#e5e7eb"} />
              <Cell fill="#e5e7eb" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold uppercase tracking-normal text-neutral-500">
          {metric.label}
        </p>
        <p className="mt-1 text-sm text-neutral-500">{metric.subtitle}</p>
        <p className="mt-4 text-5xl font-semibold text-ink-950">{formatPercent(value)}</p>
        <p className="mt-3 text-xl font-semibold text-ink-950">
          {formatNumber(metric.active)} / {formatNumber(metric.total)} países
        </p>
      </div>
    </div>
  );
}

export function CountryCompliancePie({ item }: { item?: ClubParticipationItem }) {
  if (!item) {
    return (
      <EmptyState
        message="No hay países configurados para esta vista."
        title="Cumplimiento de países"
      />
    );
  }

  const weeklyMetric: DonutMetric = {
    active: item.activeTeams,
    color: item.color,
    label: "Semanal",
    percent: item.countryCompliance,
    subtitle: `Última semana completa: ${item.lastCompletedWeekLabel}`,
    total: item.totalTeams
  };
  const monthlyMetric: DonutMetric = {
    active: item.monthlyCompliantTeams,
    color: item.color,
    label: "Mensual",
    percent: item.monthlyCountryCompliance,
    subtitle: `Mes anterior: ${item.previousMonthLabel}`,
    total: item.monthlyTotalTeams
  };

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-soft">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <img alt="" className="h-14 w-14 object-contain" src={item.logo} />
          <div>
            <h2 className="text-lg font-semibold text-ink-950">Cumplimiento de países</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Participación semanal y constancia mensual.
            </p>
          </div>
        </div>
        <div className="group relative">
          <button
            aria-label="Cómo se mide"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600"
            type="button"
          >
            <Info aria-hidden className="h-4 w-4" />
          </button>
          <div className="pointer-events-none absolute right-0 top-11 z-10 hidden w-80 rounded-lg border border-neutral-200 bg-white p-3 text-sm text-neutral-600 shadow-soft group-hover:block">
            El semanal mide cuántos países subieron al menos una mejora en la última semana
            completa. El mensual mide cuántos países subieron al menos una mejora en cada
            semana completa del mes anterior.
          </div>
        </div>
      </div>
      <div className="grid gap-8 xl:grid-cols-2">
        <ComplianceDonut metric={weeklyMetric} />
        <ComplianceDonut metric={monthlyMetric} />
      </div>
    </section>
  );
}
