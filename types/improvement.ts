export type RawSheetRow = Record<string, string>;

export type ClubName =
  | "Naciones Unidas"
  | "Valle Real"
  | "Gourmetería"
  | "Oficina Central"
  | "Sin sucursal"
  | string;

export type Improvement = {
  id: string;
  sourceRow: number;
  date: string;
  timestamp?: string;
  week: number;
  isoWeek: number;
  isoYear: number;
  weekKey: string;
  weekLabel: string;
  weekStart: string;
  month: number;
  monthKey: string;
  monthLabel: string;
  year: number;
  club: ClubName;
  rawClub?: string;
  team?: string;
  collaborator?: string;
  opportunity?: string;
  description?: string;
  category?: string;
  status?: string;
  evidence?: string;
  raw: RawSheetRow;
};

export type ColumnField =
  | "timestamp"
  | "improvementDate"
  | "week"
  | "club"
  | "team"
  | "collaborator"
  | "opportunity"
  | "description"
  | "category"
  | "status"
  | "evidence";

export type FieldMap = Partial<Record<ColumnField, string>>;

export type DashboardFilters = {
  dateFrom: string;
  dateTo: string;
  club: string;
  team: string;
  collaborator: string;
  category: string;
  week: string;
  month: string;
  year: string;
};

export type SelectOption = {
  label: string;
  value: string;
};

export type FilterOptions = {
  clubs: SelectOption[];
  teams: SelectOption[];
  collaborators: SelectOption[];
  categories: SelectOption[];
  weeks: SelectOption[];
  months: SelectOption[];
  years: SelectOption[];
};

export type CountryUniverse = Record<string, string[]>;
