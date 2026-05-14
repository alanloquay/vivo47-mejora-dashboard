import { google } from "googleapis";
import type { RawSheetRow } from "@/types/improvement";

const DEFAULT_RANGE = "Respuestas!A:S";

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

export async function fetchRowsFromGoogleSheets(): Promise<RawSheetRow[]> {
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
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
    valueRenderOption: "FORMATTED_VALUE"
  });

  const values = response.data.values ?? [];
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
