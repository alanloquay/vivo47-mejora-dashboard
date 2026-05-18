export const GLOBAL_WEEKLY_GOAL = 31;

export const ACTIVE_CLUBS = ["Naciones Unidas", "Gourmetería", "Valle Real"] as const;

export const HIDDEN_CLUBS = ["Oficina Central", "Sin sucursal"];

export const CLUB_WEEKLY_GOALS: Record<string, number | null> = {
  "Naciones Unidas": 11,
  "Valle Real": 10,
  "Gourmetería": 10
};

export const CLUB_COLORS: Record<string, string> = {
  "Naciones Unidas": "#2563eb",
  "Gourmetería": "#dc2626",
  "Valle Real": "#eab308"
};

export const CLUB_ACCENTS: Record<string, string> = {
  "Naciones Unidas": "#1d4ed8",
  "Gourmetería": "#b91c1c",
  "Valle Real": "#ca8a04"
};

export const CLUB_SHORT_NAMES: Record<string, string> = {
  "Naciones Unidas": "NAC",
  "Gourmetería": "GMT",
  "Valle Real": "VR"
};

export const CLUB_LOGOS: Record<string, string> = {
  "Naciones Unidas": "/logos/nac.png",
  "Gourmetería": "/logos/gmt.png",
  "Valle Real": "/logos/vr.png",
  "Vivo 47": "/logos/vivo47.png"
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
