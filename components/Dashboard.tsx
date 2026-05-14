"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Building2,
  CalendarDays,
  CalendarRange,
  Database,
  Download,
  Flame,
  RefreshCw,
  Target,
  Trophy
} from "lucide-react";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { ClubBarChart } from "@/components/ClubBarChart";
import { ClubWeekChart } from "@/components/ClubWeekChart";
import { EmptyState } from "@/components/EmptyState";
import { FiltersPanel } from "@/components/FiltersPanel";
import { KpiCard } from "@/components/KpiCard";
import { LatestImprovementsTable } from "@/components/LatestImprovementsTable";
import { LoadingState } from "@/components/LoadingState";
import { RankingTable } from "@/components/RankingTable";
import { StreakPanel } from "@/components/StreakPanel";
import { WeeklyLineChart } from "@/components/WeeklyLineChart";
import { DEFAULT_FILTERS } from "@/lib/constants";
import { improvementsToCsv } from "@/lib/csv";
import { formatNumber, formatPercent } from "@/lib/format";
import {
  applyDashboardFilters,
  buildFilterOptions,
  calculateDashboardMetrics
} from "@/lib/metrics";
import type { DashboardFilters, FieldMap, Improvement } from "@/types/improvement";

type ApiResponse = {
  source: "google-sheets" | "mock";
  generatedAt: string;
  rowCount: number;
  records: Improvement[];
  fieldMap: FieldMap;
  warnings: string[];
};

const sourceLabels = {
  "google-sheets": "Google Sheets",
  mock: "Mock local"
};

export function Dashboard() {
  const [records, setRecords] = useState<Improvement[]>([]);
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [source, setSource] = useState<ApiResponse["source"]>("mock");
  const [generatedAt, setGeneratedAt] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/improvements", {
        cache: "no-store"
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.detail || payload.message || "Error al cargar datos.");
      }

      const data = payload as ApiResponse;
      setRecords(data.records);
      setSource(data.source);
      setGeneratedAt(data.generatedAt);
      setWarnings(data.warnings ?? []);
      setRowCount(data.rowCount);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudo cargar la informacion."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filterOptions = useMemo(() => buildFilterOptions(records), [records]);
  const filteredRecords = useMemo(
    () => applyDashboardFilters(records, filters),
    [records, filters]
  );
  const metrics = useMemo(
    () => calculateDashboardMetrics(filteredRecords, filters),
    [filteredRecords, filters]
  );

  const handleFilterChange = (key: keyof DashboardFilters, value: string) => {
    setFilters((current) => ({
      ...current,
      [key]: value
    }));
  };

  const exportCsv = () => {
    const csv = improvementsToCsv(filteredRecords);
    const blob = new Blob(["\ufeff", csv], {
      type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mejora-1-vivo47-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const updatedAt = generatedAt
    ? new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(new Date(generatedAt))
    : "-";
  const weeklyGoalLabel =
    metrics.weeklyGoal === null ? "Sin meta" : formatNumber(metrics.weeklyGoal);
  const weeklyProgressLabel =
    metrics.weeklyGoal === null
      ? `${formatNumber(metrics.currentWeek)} mejoras sin meta fija`
      : `${formatNumber(metrics.currentWeek)} de ${formatNumber(metrics.weeklyGoal)}`;

  return (
    <main className="min-h-screen">
      <header className="px-4 pb-28 pt-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-sm text-white/80">
              <Database aria-hidden className="h-4 w-4" />
              {sourceLabels[source]} · {formatNumber(rowCount)} filas fuente
            </div>
            <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
              Dashboard Mejora del 1%
            </h1>
            <p className="mt-3 max-w-2xl text-base text-white/70 sm:text-lg">
              Seguimiento de mejoras semanales Vivo 47
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
              onClick={() => void loadData()}
              title="Refrescar datos"
              type="button"
            >
              <RefreshCw aria-hidden className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              Refrescar
            </button>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-vivo-600 px-4 text-sm font-semibold text-white transition hover:bg-vivo-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!filteredRecords.length}
              onClick={exportCsv}
              title="Exportar CSV"
              type="button"
            >
              <Download aria-hidden className="h-4 w-4" />
              CSV
            </button>
          </div>
        </div>
      </header>

      <div className="-mt-20 px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-3 rounded-lg border border-white/50 bg-white/90 p-4 text-sm text-neutral-600 shadow-soft backdrop-blur md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-vivo-600" />
              <span>
                {formatNumber(filteredRecords.length)} mejoras visibles de{" "}
                {formatNumber(records.length)} normalizadas
              </span>
            </div>
            <span>Actualizado: {updatedAt}</span>
          </div>

          {warnings.length ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {warnings.slice(0, 2).join(" ")}
            </div>
          ) : null}

          <FiltersPanel
            filters={filters}
            onChange={handleFilterChange}
            onReset={() => setFilters(DEFAULT_FILTERS)}
            options={filterOptions}
          />

          {loading && !records.length ? <LoadingState /> : null}

          {error && !records.length ? (
            <EmptyState message={error} title="No se pudo cargar Google Sheets" />
          ) : null}

          {!loading && records.length && !filteredRecords.length ? (
            <EmptyState
              message="Prueba con otro rango de fechas o limpia los filtros."
              title="Sin resultados para esta vista"
            />
          ) : null}

          {filteredRecords.length ? (
            <>
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                <KpiCard
                  helper={`Año ${new Date().getFullYear()}`}
                  icon={CalendarRange}
                  label="Total YTD"
                  tone="dark"
                  value={formatNumber(metrics.totalYtd)}
                />
                <KpiCard
                  helper="Mes actual"
                  icon={CalendarDays}
                  label="Mejoras este mes"
                  value={formatNumber(metrics.currentMonth)}
                />
                <KpiCard
                  helper={`Meta ${weeklyGoalLabel}`}
                  icon={Target}
                  label="Mejoras esta semana"
                  tone="green"
                  value={formatNumber(metrics.currentWeek)}
                />
                <KpiCard
                  helper={weeklyProgressLabel}
                  icon={BarChart3}
                  label="Cumplimiento semanal"
                  value={formatPercent(metrics.weeklyCompliance)}
                />
                <KpiCard
                  helper={
                    metrics.leadingClub
                      ? `${formatNumber(metrics.leadingClub.count)} mejoras`
                      : "Sin datos"
                  }
                  icon={Trophy}
                  label="Club líder"
                  tone="dark"
                  value={metrics.leadingClub?.club ?? "-"}
                />
                <KpiCard
                  helper={metrics.longestStreak?.club ?? "Sin racha"}
                  icon={Flame}
                  label="Racha más larga"
                  tone="green"
                  value={`${metrics.longestStreak?.streak ?? 0} sem`}
                />
              </section>

              <section className="grid gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2">
                  <WeeklyLineChart data={metrics.weeklySeries} />
                </div>
                <ClubBarChart data={metrics.clubTotals} />
              </section>

              <section className="grid gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2">
                  <ClubWeekChart
                    clubKeys={metrics.clubWeekKeys}
                    data={metrics.clubWeekSeries}
                  />
                </div>
                <section className="rounded-lg border border-neutral-200 bg-ink-950 p-5 text-white shadow-soft">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">Cumplimiento acumulado</h2>
                      <p className="mt-1 text-sm text-white/60">
                        Semanas completas contra meta global.
                      </p>
                    </div>
                    <Building2 aria-hidden className="h-5 w-5 text-vivo-400" />
                  </div>
                  <p className="text-5xl font-semibold">
                    {formatPercent(metrics.accumulatedCompliance)}
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-white/[0.08] p-4">
                      <p className="text-sm text-white/60">Cumplidas</p>
                      <p className="mt-2 text-2xl font-semibold">
                        {formatNumber(metrics.fulfilledWeeks)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/[0.08] p-4">
                      <p className="text-sm text-white/60">No cumplidas</p>
                      <p className="mt-2 text-2xl font-semibold">
                        {formatNumber(metrics.missedWeeks)}
                      </p>
                    </div>
                  </div>
                </section>
              </section>

              <section className="grid gap-6 xl:grid-cols-3">
                <StreakPanel streaks={metrics.streaks} />
                <RankingTable
                  emptyTitle="Sin ranking de colaboradores"
                  items={metrics.topCollaborators}
                  subtitle="Personas con mayor número de mejoras."
                  title="Top colaboradores"
                />
                <RankingTable
                  emptyTitle="Sin ranking de equipos"
                  items={metrics.topTeams}
                  subtitle="Equipos o áreas con más participación."
                  title="Top equipos"
                />
              </section>

              <section className="grid gap-6 xl:grid-cols-3">
                <ActivityHeatmap data={metrics.dayActivity} />
                <RankingTable
                  emptyTitle="Sin categorias"
                  items={metrics.categoryTotals}
                  subtitle="Tipos de impacto registrados."
                  title="Categorías de mejora"
                />
                <div className="xl:col-span-1">
                  <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-soft">
                    <h2 className="text-lg font-semibold text-ink-950">Metas semanales</h2>
                    <div className="mt-5 space-y-3 text-sm">
                      <div className="flex justify-between border-b border-neutral-100 pb-3">
                        <span>Naciones Unidas</span>
                        <strong>11</strong>
                      </div>
                      <div className="flex justify-between border-b border-neutral-100 pb-3">
                        <span>Valle Real</span>
                        <strong>10</strong>
                      </div>
                      <div className="flex justify-between border-b border-neutral-100 pb-3">
                        <span>Gourmetería</span>
                        <strong>10</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Oficina Central</span>
                        <strong>sin fija</strong>
                      </div>
                    </div>
                  </section>
                </div>
              </section>

              <LatestImprovementsTable records={metrics.latest} />
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
