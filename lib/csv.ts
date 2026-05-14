import type { Improvement } from "@/types/improvement";

function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function improvementsToCsv(records: Improvement[]) {
  const headers = [
    "fecha",
    "semana",
    "sucursal",
    "equipo",
    "colaborador",
    "categoria",
    "estado",
    "oportunidad",
    "descripcion"
  ];
  const rows = records.map((record) => [
    record.date,
    record.weekLabel,
    record.club,
    record.team ?? "",
    record.collaborator ?? "",
    record.category ?? "",
    record.status ?? "",
    record.opportunity ?? "",
    record.description ?? ""
  ]);

  return [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");
}
