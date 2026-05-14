import type { RawSheetRow } from "@/types/improvement";

const clubs = ["Naciones Unidas", "Valle Real", "Gourmetería", "Oficina Central"];
const teams = [
  "Brasil",
  "Argentina",
  "Chile",
  "Colombia",
  "Uruguay",
  "FIFA (Oficina Central)"
];
const collaborators = [
  "Alan Rene Loquay",
  "Erika Banales",
  "Angel Salcedo",
  "Israel Cota",
  "Gustavo Zarate",
  "Rps Valle Real",
  "Equipo Operaciones"
];
const categories = [
  "Experiencia del socio",
  "Operacion del equipo",
  "Orden y limpieza",
  "Comunicacion / claridad",
  "Otro"
];
const statuses = ["Ya esta activa", "En proceso de activacion"];

function formatUsDate(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

function makeDate(week: number, offset: number) {
  const base = new Date(2026, 0, 5);
  base.setDate(base.getDate() + (week - 2) * 7 + offset);
  return base;
}

export const MOCK_ROWS: RawSheetRow[] = Array.from({ length: 92 }, (_, index) => {
  const week = 2 + (index % 18);
  const club = clubs[index % clubs.length];
  const date = makeDate(week, index % 6);
  const team = club === "Oficina Central" ? "FIFA (Oficina Central)" : teams[index % 5];
  const collaborator = collaborators[index % collaborators.length];
  const category = categories[index % categories.length];

  return {
    Timestamp: `${formatUsDate(date)} 10:${String(15 + (index % 40)).padStart(2, "0")}:00`,
    "Fecha de registro de la mejora": formatUsDate(date),
    Semana: String(week),
    Sucursal: club,
    "Equipo (País)": team,
    "Nombre completo ": collaborator,
    "¿Qué oportunidad detectamos esta semana?": `Oportunidad ${index + 1} en ${club}`,
    "Explica la mejora del 1% que se activó esta semana": `Mejora semanal enfocada en ${category.toLowerCase()} para ${team}.`,
    "¿En qué impacta principalmente esta mejora?": category,
    "Estado de la mejora": statuses[index % statuses.length],
    "Evidencia de la mejora": "",
    "Semana ISO": String(week)
  };
});
