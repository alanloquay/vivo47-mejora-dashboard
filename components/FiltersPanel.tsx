"use client";

import { RotateCcw } from "lucide-react";
import type {
  DashboardFilters,
  FilterOptions,
  SelectOption
} from "@/types/improvement";

type FiltersPanelProps = {
  filters: DashboardFilters;
  options: FilterOptions;
  onChange: (key: keyof DashboardFilters, value: string) => void;
  onReset: () => void;
};

function SelectField({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="min-w-0">
      <span className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
        {label}
      </span>
      <select
        className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-ink-950 outline-none transition focus:border-vivo-600 focus:ring-2 focus:ring-vivo-100 disabled:bg-neutral-100"
        disabled={!options.length}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="all">Todos</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function DateField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
        {label}
      </span>
      <input
        className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-ink-950 outline-none transition focus:border-vivo-600 focus:ring-2 focus:ring-vivo-100"
        onChange={(event) => onChange(event.target.value)}
        type="date"
        value={value}
      />
    </label>
  );
}

export function FiltersPanel({
  filters,
  options,
  onChange,
  onReset
}: FiltersPanelProps) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-soft">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          <DateField
            label="Desde"
            onChange={(value) => onChange("dateFrom", value)}
            value={filters.dateFrom}
          />
          <DateField
            label="Hasta"
            onChange={(value) => onChange("dateTo", value)}
            value={filters.dateTo}
          />
          <SelectField
            label="Club"
            onChange={(value) => onChange("club", value)}
            options={options.clubs}
            value={filters.club}
          />
          <SelectField
            label="Equipo"
            onChange={(value) => onChange("team", value)}
            options={options.teams}
            value={filters.team}
          />
          <SelectField
            label="Colaborador"
            onChange={(value) => onChange("collaborator", value)}
            options={options.collaborators}
            value={filters.collaborator}
          />
          <SelectField
            label="Categoría"
            onChange={(value) => onChange("category", value)}
            options={options.categories}
            value={filters.category}
          />
          <SelectField
            label="Semana"
            onChange={(value) => onChange("week", value)}
            options={options.weeks}
            value={filters.week}
          />
          <SelectField
            label="Mes"
            onChange={(value) => onChange("month", value)}
            options={options.months}
            value={filters.month}
          />
          <SelectField
            label="Año"
            onChange={(value) => onChange("year", value)}
            options={options.years}
            value={filters.year}
          />
        </div>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
          onClick={onReset}
          type="button"
        >
          <RotateCcw aria-hidden className="h-4 w-4" />
          Limpiar
        </button>
      </div>
    </section>
  );
}
