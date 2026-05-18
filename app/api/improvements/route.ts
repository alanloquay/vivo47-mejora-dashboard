import { NextResponse } from "next/server";
import {
  fetchDashboardDataFromGoogleSheets,
  hasGoogleSheetsConfig
} from "@/lib/googleSheets";
import { MOCK_ROWS } from "@/lib/mockData";
import { normalizeSheetRows } from "@/lib/normalizeData";
import type { CountryUniverse } from "@/types/improvement";

export const dynamic = "force-dynamic";

export async function GET() {
  const forceMock = process.env.USE_MOCK_DATA === "true";
  const useMock = forceMock || !hasGoogleSheetsConfig();

  try {
    const sheetData = useMock
      ? { rows: MOCK_ROWS, countryUniverse: {} as CountryUniverse }
      : await fetchDashboardDataFromGoogleSheets();
    const rawRows = sheetData.rows;
    const normalized = normalizeSheetRows(rawRows);

    return NextResponse.json({
      source: useMock ? "mock" : "google-sheets",
      generatedAt: new Date().toISOString(),
      rowCount: rawRows.length,
      countryUniverse: sheetData.countryUniverse,
      ...normalized,
      warnings: [
        ...normalized.warnings,
        ...(useMock
          ? ["Usando datos mock. Configura las variables de entorno para leer Google Sheets."]
          : [])
      ]
    });
  } catch (error) {
    console.error("[improvements-api]", error);
    return NextResponse.json(
      {
        message: "No se pudo leer Google Sheets.",
        detail:
          error instanceof Error
            ? error.message
            : "Error desconocido al consultar la fuente de datos."
      },
      { status: 502 }
    );
  }
}
