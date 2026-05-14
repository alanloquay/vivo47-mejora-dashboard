import { NextResponse } from "next/server";
import { fetchRowsFromGoogleSheets, hasGoogleSheetsConfig } from "@/lib/googleSheets";
import { MOCK_ROWS } from "@/lib/mockData";
import { normalizeSheetRows } from "@/lib/normalizeData";

export const dynamic = "force-dynamic";

export async function GET() {
  const forceMock = process.env.USE_MOCK_DATA === "true";
  const useMock = forceMock || !hasGoogleSheetsConfig();

  try {
    const rawRows = useMock ? MOCK_ROWS : await fetchRowsFromGoogleSheets();
    const normalized = normalizeSheetRows(rawRows);

    return NextResponse.json({
      source: useMock ? "mock" : "google-sheets",
      generatedAt: new Date().toISOString(),
      rowCount: rawRows.length,
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
