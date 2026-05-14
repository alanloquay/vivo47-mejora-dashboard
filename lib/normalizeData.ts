import type { FieldMap, Improvement, RawSheetRow } from "@/types/improvement";

const FIELD_ALIASES: Record<keyof FieldMap, string[]> = {
  timestamp: ["timestamp", "marca temporal", "fecha y hora"],
  improvementDate: [
    "fecha de registro de la mejora",
    "fecha registro mejora",
    "fecha de mejora",
    "fecha",
    "date"
  ],
  week: ["semana iso", "semana", "week"],
  club: ["sucursal", "club", "sede", "unidad", "ubicacion", "ubicación"],
  team: [
    "equipo (pais)",
    "equipo (país)",
    "equipo pais",
    "equipo país",
    "equipo",
    "pais",
    "país",
    "area",
    "área",
    "departamento"
  ],
  collaborator: [
    "nombre completo",
    "colaborador",
    "colaboradora",
    "responsable",
    "nombre"
  ],
  opportunity: [
    "que oportunidad detectamos esta semana",
    "qué oportunidad detectamos esta semana",
    "oportunidad",
    "problema detectado"
  ],
  description: [
    "explica la mejora del 1 que se activo esta semana",
    "explica la mejora del 1% que se activó esta semana",
    "mejora",
    "descripcion",
    "descripción"
  ],
  category: [
    "en que impacta principalmente esta mejora",
    "en qué impacta principalmente esta mejora",
    "impacto",
    "categoria",
    "categoría",
    "tipo de mejora"
  ],
  status: ["estado de la mejora", "estado", "estatus"],
  evidence: ["evidencia de la mejora", "evidencia", "archivo"]
};

const CLUB_ALIASES = [
  {
    name: "Naciones Unidas",
    aliases: ["naciones unidas", "naciones", "nac", "nu"]
  },
  {
    name: "Valle Real",
    aliases: ["valle real", "vr", "valle"]
  },
  {
    name: "Gourmetería",
    aliases: ["gourmeteria", "gourmetería", "gmt"]
  },
  {
    name: "Oficina Central",
    aliases: ["oficina central", "ofc", "oficina", "central"]
  }
];

const MONTH_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  month: "short",
  year: "numeric"
});

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!().,%:/_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function cleanCell(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function normalizeClub(value?: string) {
  const raw = cleanCell(value);
  if (!raw) {
    return "Sin sucursal";
  }

  const normalized = normalizeText(raw);
  const match = CLUB_ALIASES.find((club) =>
    club.aliases.some((alias) => normalized === alias || normalized.includes(alias))
  );

  return match?.name ?? toTitleCase(raw);
}

function getRowValue(row: RawSheetRow, header?: string) {
  if (!header) {
    return "";
  }

  return cleanCell(row[header]);
}

function parseDateParts(text: string) {
  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    return {
      year: Number(iso[1]),
      month: Number(iso[2]),
      day: Number(iso[3]),
      hour: 0,
      minute: 0,
      second: 0
    };
  }

  const slash = text.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/
  );
  if (!slash) {
    return null;
  }

  const first = Number(slash[1]);
  const second = Number(slash[2]);
  const rawYear = Number(slash[3]);
  const year = rawYear < 100 ? 2000 + rawYear : rawYear;

  // The source spreadsheet is configured as en_US, so ambiguous dates default to MM/DD/YYYY.
  const month = first > 12 ? second : first;
  const day = first > 12 ? first : second;

  return {
    year,
    month,
    day,
    hour: Number(slash[4] ?? 0),
    minute: Number(slash[5] ?? 0),
    second: Number(slash[6] ?? 0)
  };
}

export function parseFlexibleDate(value?: string) {
  const text = cleanCell(value);
  if (!text) {
    return null;
  }

  const parts = parseDateParts(text);
  if (!parts) {
    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const date = new Date(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== parts.year ||
    date.getMonth() !== parts.month - 1 ||
    date.getDate() !== parts.day
  ) {
    return null;
  }

  return date;
}

export function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function startOfISOWeek(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay() || 7;
  copy.setDate(copy.getDate() - day + 1);
  return copy;
}

export function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function getISOWeekInfo(date: Date) {
  const target = new Date(date.valueOf());
  target.setHours(0, 0, 0, 0);
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));

  const weekOne = new Date(target.getFullYear(), 0, 4);
  const isoWeek =
    1 +
    Math.round(
      ((target.getTime() - weekOne.getTime()) / 86400000 -
        3 +
        ((weekOne.getDay() + 6) % 7)) /
        7
    );

  return {
    isoYear: target.getFullYear(),
    isoWeek
  };
}

export function getWeekKey(date: Date) {
  const info = getISOWeekInfo(date);
  return `${info.isoYear}-W${String(info.isoWeek).padStart(2, "0")}`;
}

function buildFieldMap(headers: string[]) {
  const normalizedHeaders = headers.map((header) => ({
    original: header,
    normalized: normalizeText(header)
  }));

  return Object.entries(FIELD_ALIASES).reduce<FieldMap>((map, [field, aliases]) => {
    const normalizedAliases = aliases.map(normalizeText);
    const exact = normalizedHeaders.find((header) =>
      normalizedAliases.includes(header.normalized)
    );
    const loose =
      exact ??
      normalizedHeaders.find((header) =>
        normalizedAliases.some(
          (alias) =>
            header.normalized.includes(alias) || alias.includes(header.normalized)
        )
      );

    if (loose) {
      map[field as keyof FieldMap] = loose.original;
    }

    return map;
  }, {});
}

export function normalizeSheetRows(rawRows: RawSheetRow[]) {
  const headers = Array.from(
    rawRows.reduce<Set<string>>((set, row) => {
      Object.keys(row).forEach((header) => set.add(header));
      return set;
    }, new Set())
  );
  const fieldMap = buildFieldMap(headers);
  const warnings: string[] = [];

  if (!fieldMap.improvementDate && !fieldMap.timestamp) {
    warnings.push("No se encontró una columna clara de fecha.");
  }
  if (!fieldMap.club) {
    warnings.push("No se encontró una columna clara de sucursal o club.");
  }

  const records = rawRows.flatMap<Improvement>((row, index) => {
    const dateValue =
      getRowValue(row, fieldMap.improvementDate) || getRowValue(row, fieldMap.timestamp);
    const date = parseFlexibleDate(dateValue);
    const opportunity = getRowValue(row, fieldMap.opportunity);
    const description = getRowValue(row, fieldMap.description);
    const rawClub = getRowValue(row, fieldMap.club);

    if (!date || (!rawClub && !opportunity && !description)) {
      return [];
    }

    const weekInfo = getISOWeekInfo(date);
    const weekStartDate = startOfISOWeek(date);
    const weekKey = `${weekInfo.isoYear}-W${String(weekInfo.isoWeek).padStart(2, "0")}`;
    const month = date.getMonth() + 1;
    const monthKey = `${date.getFullYear()}-${String(month).padStart(2, "0")}`;
    const explicitWeek = Number(getRowValue(row, fieldMap.week));

    return [
      {
        id: `row-${index + 2}`,
        sourceRow: index + 2,
        date: toISODate(date),
        timestamp: getRowValue(row, fieldMap.timestamp) || undefined,
        week: Number.isFinite(explicitWeek) && explicitWeek > 0 ? explicitWeek : weekInfo.isoWeek,
        isoWeek: weekInfo.isoWeek,
        isoYear: weekInfo.isoYear,
        weekKey,
        weekLabel: `S${String(weekInfo.isoWeek).padStart(2, "0")} ${weekInfo.isoYear}`,
        weekStart: toISODate(weekStartDate),
        month,
        monthKey,
        monthLabel: MONTH_FORMATTER.format(date).replace(".", ""),
        year: date.getFullYear(),
        club: normalizeClub(rawClub),
        rawClub: rawClub || undefined,
        team: getRowValue(row, fieldMap.team) || undefined,
        collaborator: getRowValue(row, fieldMap.collaborator) || undefined,
        opportunity: opportunity || undefined,
        description: description || undefined,
        category: getRowValue(row, fieldMap.category) || undefined,
        status: getRowValue(row, fieldMap.status) || undefined,
        evidence: getRowValue(row, fieldMap.evidence) || undefined,
        raw: row
      }
    ];
  });

  return {
    records,
    fieldMap,
    warnings
  };
}
