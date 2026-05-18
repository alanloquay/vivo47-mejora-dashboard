import { google } from "googleapis";
import type { CountryUniverse, RawSheetRow } from "@/types/improvement";

const DEFAULT_RANGE = "Respuestas!A:S";
const UNIVERSE_RANGES: Record<string, string> = {
  "Naciones Unidas": "Universo_NAC!A:Z",
  "Gourmetería": "Universo_GMT!A:Z",
  "Valle Real": "Universo_VR!A:Z"
};

function normalizePrivateKey(privateKey: string) {
  return privateKey.replace(/\\n/g, "\n");
}

function extractSpreadsheetId(value: string) {
  const match = value.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match?.[1] ?? value;
}

export function hasGoogleSheetsConfig() {
  return Boolean(
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID &&
      process.env.GOOGLE_SHEETS_CLIENT_EMAIL &&
      process.env.GOOGLE_SHEETS_PRIVATE_KEY
  );
}

function valuesToRows(values: unknown[][]): RawSheetRow[] {
  if (values.length === 0) {
    return [];
  }

  const headers = values[0].map((header, index) => {
    const text = String(header ?? "").trim();
    return text || `Column ${index + 1}`;
  });

  return values.slice(1).flatMap((row) => {
    const item: RawSheetRow = {};
    headers.forEach((header, index) => {
      item[header] = String(row[index] ?? "").trim();
    });

    const hasAnyValue = Object.values(item).some((value) => value.length > 0);
    return hasAnyValue ? [item] : [];
  });
}

function cleanUniverseName(value: unknown) {
  const text = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
  const normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const skip = [
    "",
    "pais",
    "paises",
    "equipo",
    "semana",
    "club",
    "area",
    "departamento"
  ];

  if (
    skip.includes(normalized) ||
    normalized.includes("universo") ||
    normalized.includes("semana") ||
    normalized.includes("europa") ||
    normalized.includes("nac") ||
    normalized.includes("gmt") ||
    normalized.includes("vr")
  ) {
    return "";
  }

  return text;
}

function parseUniverse(values: unknown[][]) {
  const names = values
    .map((row) => cleanUniverseName(row[0]))
    .filter(Boolean);

  return Array.from(new Set(names));
}

export async function fetchRowsFromGoogleSheets(): Promise<RawSheetRow[]> {
  const data = await fetchDashboardDataFromGoogleSheets();
  return data.rows;
}

export async function fetchDashboardDataFromGoogleSheets(): Promise<{
  rows: RawSheetRow[];
  countryUniverse: CountryUniverse;
}> {
  const spreadsheetId = extractSpreadsheetId(
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? ""
  );
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  const range = process.env.GOOGLE_SHEETS_RANGE || DEFAULT_RANGE;

  if (!spreadsheetId || !clientEmail || !privateKey) {
    throw new Error("Google Sheets credentials are not configured.");
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: normalizePrivateKey(privateKey),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  });

  const sheets = google.sheets({ version: "v4", auth });
  const ranges = [range, ...Object.values(UNIVERSE_RANGES)];
  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges,
    valueRenderOption: "FORMATTED_VALUE"
  });

  const valueRanges = response.data.valueRanges ?? [];
  const responseRows = valuesToRows((valueRanges[0]?.values ?? []) as unknown[][]);
  const universeEntries = Object.keys(UNIVERSE_RANGES).map((club, index) => [
    club,
    parseUniverse((valueRanges[index + 1]?.values ?? []) as unknown[][])
  ]);

  return {
    rows: responseRows,
    countryUniverse: Object.fromEntries(universeEntries)
  };
}
