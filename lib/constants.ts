export const GLOBAL_WEEKLY_GOAL = 31;

export const CLUB_WEEKLY_GOALS: Record<string, number | null> = {
  "Naciones Unidas": 11,
  "Valle Real": 10,
  "Gourmetería": 10,
  "Oficina Central": null
};

export const CLUB_COLORS: Record<string, string> = {
  "Naciones Unidas": "#087746",
  "Valle Real": "#12b96a",
  "Gourmetería": "#0a5e3a",
  "Oficina Central": "#4b5563",
  "Sin sucursal": "#9ca3af"
};

export const DEFAULT_FILTERS = {
  dateFrom: "",
  dateTo: "",
  club: "all",
  team: "all",
  collaborator: "all",
  category: "all",
  week: "all",
  month: "all",
  year: "all"
};
