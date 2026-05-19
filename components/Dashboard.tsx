"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  Database,
  Download,
  RefreshCw,
  Target,
  Trophy,
  Users
} from "lucide-react";
import { ACTIVE_CLUBS, CLUB_COLORS, CLUB_LOGOS, DEFAULT_FILTERS } from "@/lib/constants";
import { improvementsToCsv } from "@/lib/csv";
import { formatNumber, formatPercent } from "@/lib/format";
import {
  applyDashboardFilters,
  buildFilterOptions,
  calculateDashboardMetrics,
  filterVisibleRecords
} from "@/lib/metrics";
import { ClubBarChart } from "@/components/ClubBarChart";
import { ClubParticipationPanel } from "@/components/ClubParticipationPanel";
import { ClubWeekChart } from "@/components/ClubWeekChart";
import { CountryCompliancePie } from "@/components/CountryCompliancePie";
import { CountryRankingPanel } from "@/components/CountryRankingPanel";
import { CountryStreakRanking } from "@/components/CountryStreakRanking";
import { EmptyState } from "@/components/EmptyState";
import { FiltersPanel } from "@/components/FiltersPanel";
import { KpiCard } from "@/components/KpiCard";
import { LoadingState } from "@/components/LoadingState";
import { ParticipationMatrix } from "@/components/ParticipationMatrix";
import { WeeklyLineChart } from "@/components/WeeklyLineChart";
import type {
  CountryUniverse,
  DashboardFilters,
  FieldMap,
  Improvement
} from "@/types/improvement";

type ApiResponse = {
  source: "google-sheets" | "mock";
  generatedAt: string;
  rowCount: number;
  records: Improvement[];
  fieldMap: FieldMap;
  countryUniverse?: CountryUniverse;
  warnings: string[];
};

type DashboardTab = "Vivo 47" | (typeof ACTIVE_CLUBS)[number];

const tabs: DashboardTab[] = ["Vivo 47", ...ACTIVE_CLUBS];

const sourceLabels = {
  "google-sheets": "Google Sheets",
  mock: "Mock local"
};

const generalFilterFields: Array<keyof DashboardFilters> = [
  "dateFrom",
  "dateTo",
  "week",
  "month",
  "year"
];

function tabLogo(tab: DashboardTab) {
  return tab === "Vivo 47" ? CLUB_LOGOS["Vivo 47"] : CLUB_LOGOS[tab];
}

function viewBackground(tab: DashboardTab) {
  if (tab === "Vivo 47") {
    return "linear-gradient(180deg, #e8f7ef 0%, #f7faf8 48%, #eef3ef 100%)";
  }

  const subtle: Record<string, string> = {
    "Naciones Unidas": "linear-gradient(180deg, #eaf2ff 0%, #f7faff 46%, #edf4ff 100%)",
    "Gourmetería": "linear-gradient(180deg, #fff0f0 0%, #fffafa 46%, #fff1f1 100%)",
    "Valle Real": "linear-gradient(180deg, #fff8db 0%, #fffdf3 46%, #fff7d6 100%)"
  };

  return subtle[tab] ?? "#f5f6f4";
}

export function Dashboard() {
  const [records, setRecords] = useState<Improvement[]>([]);
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [activeTab, setActiveTab] = useState<DashboardTab>("Vivo 47");
  const [source, setSource] = useState<ApiResponse["source"]>("mock");
  const [generatedAt, setGeneratedAt] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [countryUniverse, setCountryUniverse] = useState<CountryUniverse>({});
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
      setCountryUniverse(data.countryUniverse ?? {});
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudo cargar la información."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const visibleRecords = useMemo(() => filterVisibleRecords(records), [records]);
  const viewRecords = useMemo(
    () =>
      activeTab === "Vivo 47"
        ? visibleRecords
        : visibleRecords.filter((record) => record.club === activeTab),
    [activeTab, visibleRecords]
  );
  const filterOptions = useMemo(() => buildFilterOptions(viewRecords), [viewRecords]);
  const appliedFilters = useMemo(
    () => ({
      ...filters,
      club: "all",
      collaborator: "all",
      category: "all"
    }),
    [filters]
  );
  const filteredRecords = useMemo(
    () => applyDashboardFilters(viewRecords, appliedFilters),
    [viewRecords, appliedFilters]
  );
  const metricsFilters = useMemo(
    () => ({
      ...appliedFilters,
      club: activeTab === "Vivo 47" ? "all" : activeTab
    }),
    [activeTab, appliedFilters]
  );
  const metrics = useMemo(
    () =>
      calculateDashboardMetrics(
        filteredRecords,
        metricsFilters,
        new Date(),
        countryUniverse,
        viewRecords
      ),
    [countryUniverse, filteredRecords, metricsFilters, viewRecords]
  );
  const selectedClubParticipation =
    activeTab === "Vivo 47"
      ? undefined
      : metrics.clubParticipation.find((item) => item.club === activeTab);

  const handleFilterChange = (key: keyof DashboardFilters, value: string) => {
    setFilters((current) => ({
      ...current,
      [key]: value
    }));
  };

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    setFilters(DEFAULT_FILTERS);
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
  const countryLeader = metrics.topCountries[0];
  const streakLeader = metrics.topCountryStreaks[0];

  return (
    <main className="min-h-screen" style={{ background: viewBackground(activeTab) }}>
      <header className="px-4 pb-28 pt-8 text-ink-950 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-white/70 bg-white/80 px-3 py-1.5 text-sm text-neutral-700 shadow-soft">
              <Database aria-hidden className="h-4 w-4" />
              {sourceLabels[source]} · {formatNumber(rowCount)} filas fuente
            </div>
            <div className="flex items-center gap-4">
              <img alt="" className="h-16 w-16 object-contain" src={tabLogo(activeTab)} />
              <div>
                <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
                  Dashboard Mejora del 1%
                </h1>
                <p className="mt-3 max-w-2xl text-base text-neutral-700 sm:text-lg">
                  {activeTab === "Vivo 47"
                    ? "Seguimiento general de mejoras semanales Vivo 47"
                    : `Seguimiento de mejoras semanales ${activeTab}`}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white/85 px-4 text-sm font-semibold text-ink-950 shadow-soft transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
              onClick={() => void loadData()}
              title="Refrescar datos"
              type="button"
            >
              <RefreshCw aria-hidden className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              Refrescar
            </button>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-vivo-600 px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-vivo-700 disabled:cursor-not-allowed disabled:opacity-60"
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
          <nav className="rounded-lg border border-white/50 bg-white/95 p-2 shadow-soft backdrop-blur">
            <div className="grid gap-2 sm:grid-cols-4">
              {tabs.map((tab) => {
                const active = activeTab === tab;
                return (
                  <button
                    className={
                      active
                        ? "flex h-14 items-center justify-center gap-3 rounded-lg bg-ink-950 px-4 text-sm font-semibold text-white"
                        : "flex h-14 items-center justify-center gap-3 rounded-lg px-4 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100"
                    }
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    type="button"
                  >
                    <img alt="" className="h-8 w-8 object-contain" src={tabLogo(tab)} />
                    {tab === "Vivo 47" ? "Vivo 47" : tab}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="flex flex-col gap-3 rounded-lg border border-white/50 bg-white/90 p-4 text-sm text-neutral-600 shadow-soft backdrop-blur md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-vivo-600" />
              <span>
                {formatNumber(filteredRecords.length)} mejoras visibles de{" "}
                {formatNumber(viewRecords.length)} normalizadas
              </span>
            </div>
            <span>Actualizado: {updatedAt}</span>
          </div>

          {warnings.length ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {warnings.slice(0, 2).join(" ")}
            </div>
          ) : null}

          {activeTab === "Vivo 47" ? (
            <FiltersPanel
              filters={filters}
              onChange={handleFilterChange}
              onReset={() => setFilters(DEFAULT_FILTERS)}
              options={filterOptions}
              visibleFields={generalFilterFields}
            />
          ) : null}

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
                  label="Última semana"
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
                    activeTab === "Vivo 47"
                      ? `${formatNumber(metrics.leadingClub?.count ?? 0)} mejoras`
                      : `${formatNumber(countryLeader?.count ?? 0)} mejoras`
                  }
                  icon={Trophy}
                  label={activeTab === "Vivo 47" ? "Club líder" : "País líder"}
                  tone="dark"
                  value={
                    activeTab === "Vivo 47"
                      ? metrics.leadingClub?.club ?? "-"
                      : countryLeader?.name ?? "-"
                  }
                />
                <KpiCard
                  helper={
                    streakLeader
                      ? `${streakLeader.club} · ${streakLeader.streak} semanas`
                      : "Sin racha activa"
                  }
                  icon={Users}
                  label="Racha país líder"
                  tone="green"
                  value={streakLeader?.team ?? "-"}
                />
              </section>

              {activeTab === "Vivo 47" ? (
                <>
                  <section className="grid gap-6 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                      <WeeklyLineChart
                        data={metrics.weeklySeries}
                        subtitle="Total Vivo 47 contra meta semanal de 31 mejoras."
                        title="Tendencia Vivo 47"
                      />
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
                    <CountryStreakRanking items={metrics.topCountryStreaks} />
                  </section>

                  <section className="grid gap-6 xl:grid-cols-3">
                    <CountryRankingPanel
                      items={metrics.topCountries}
                      subtitle="Países con más mejoras registradas."
                      title="Top países"
                    />
                    <div className="xl:col-span-2">
                      <ClubParticipationPanel items={metrics.clubParticipation} />
                    </div>
                  </section>
                </>
              ) : (
                <>
                  <section className="grid gap-6 2xl:grid-cols-5">
                    <div className="2xl:col-span-3">
                      <WeeklyLineChart
                        data={metrics.weeklySeries}
                        color={CLUB_COLORS[activeTab] ?? "#12b96a"}
                        subtitle={`Avance semanal de ${activeTab} contra su meta.`}
                        title={`Tendencia ${activeTab}`}
                      />
                    </div>
                    <div className="2xl:col-span-2">
                      <CountryCompliancePie item={selectedClubParticipation} />
                    </div>
                  </section>

                  <ParticipationMatrix
                    color={selectedClubParticipation?.color ?? "#12b96a"}
                    rows={metrics.participationMatrix}
                    weeks={metrics.matrixWeeks}
                  />

                  <section className="grid gap-6 xl:grid-cols-2">
                    <CountryRankingPanel
                      items={metrics.topCountries}
                      subtitle="Países con más mejoras dentro del club."
                      title="Ranking de países"
                    />
                    <CountryStreakRanking items={metrics.topCountryStreaks} />
                  </section>
                </>
              )}
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
