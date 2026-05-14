# Dashboard Mejora del 1% - Vivo 47

Web app en Next.js para visualizar el programa **Mejora del 1%** a partir de respuestas de Google Forms almacenadas en Google Sheets.

La hoja original se lee en modo solo lectura. El frontend no recibe credenciales: la lectura ocurre desde la API route de Next.js en `app/api/improvements/route.ts`.

## Stack

- Next.js + React + TypeScript
- Tailwind CSS
- Recharts
- Google Sheets API via service account

## Estructura

```txt
app/
  api/improvements/route.ts   # Endpoint seguro para leer Google Sheets
  page.tsx                    # Pagina principal
components/                   # Cards, filtros, graficas, rankings y tablas
lib/
  googleSheets.ts             # Conexion server-side a Google Sheets
  normalizeData.ts            # Mapeo flexible, fechas, clubes y limpieza
  metrics.ts                  # KPIs, rachas, rankings y series
  constants.ts                # Metas y colores
  mockData.ts                 # Datos mock para desarrollo
types/
  improvement.ts              # Tipos compartidos
```

## Instalacion local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Variables de entorno

Copia `.env.example` a `.env.local` y completa los valores:

```bash
GOOGLE_SHEETS_SPREADSHEET_ID=17jANIWXZYQt6EY0p7VRpC1XeAzH-2ploBhebml-9XyU
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_RANGE=Respuestas!A:S
USE_MOCK_DATA=false
```

Si faltan credenciales o `USE_MOCK_DATA=true`, el dashboard usa datos mock y muestra un aviso.

## Configurar Google Sheets API

1. Crea un proyecto en Google Cloud.
2. Habilita **Google Sheets API**.
3. Crea una **Service Account**.
4. Genera una llave JSON para esa cuenta.
5. Comparte el Google Sheets con el email de la service account como lector.
6. Copia `client_email` en `GOOGLE_SHEETS_CLIENT_EMAIL`.
7. Copia `private_key` en `GOOGLE_SHEETS_PRIVATE_KEY`, conservando los saltos como `\n`.

El rango sugerido es `Respuestas!A:S`, porque la hoja actual tiene columnas hasta `Semana ISO`.

## Columnas detectadas

La normalizacion no depende de nombres rigidos, pero la hoja actual contiene:

- `Timestamp`
- `Fecha de registro de la mejora`
- `Semana`
- `Sucursal`
- `Equipo (Pais)`
- `Nombre completo`
- `Que oportunidad detectamos esta semana`
- `Explica la mejora del 1% que se activo esta semana`
- `En que impacta principalmente esta mejora`
- `Estado de la mejora`
- `Evidencia de la mejora`
- `Semana ISO`

Si Google Forms cambia nombres, agrega aliases en `lib/normalizeData.ts`.

## Metas semanales

Las metas viven en `lib/constants.ts`:

```ts
export const GLOBAL_WEEKLY_GOAL = 31;

export const CLUB_WEEKLY_GOALS = {
  "Naciones Unidas": 11,
  "Valle Real": 10,
  "Gourmetería": 10,
  "Oficina Central": null
};
```

`Oficina Central` se visualiza, pero no se castiga en rachas porque no tiene meta fija.

## Calculo de rachas

La racha se calcula por club usando semanas ISO de lunes a domingo.

- Se ordenan semanas completas cronologicamente.
- Se excluye siempre la semana actual.
- Una semana cumple si `mejoras >= meta semanal del club`.
- Si falta una semana, cuenta como 0 y rompe la racha.
- `Oficina Central` aparece como `sin meta fija`.

## Alternativa con Google Apps Script

Si prefieres no usar Google Cloud/service account, puedes publicar un endpoint JSON con Apps Script:

```js
function doGet() {
  const spreadsheet = SpreadsheetApp.openById("17jANIWXZYQt6EY0p7VRpC1XeAzH-2ploBhebml-9XyU");
  const sheet = spreadsheet.getSheetByName("Respuestas");
  const values = sheet.getDataRange().getDisplayValues();
  const headers = values.shift();
  const rows = values
    .filter((row) => row.some(Boolean))
    .map((row) =>
      headers.reduce((item, header, index) => {
        item[header || `Column ${index + 1}`] = row[index] || "";
        return item;
      }, {})
    );

  return ContentService
    .createTextOutput(JSON.stringify({ rows }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Despues puedes ajustar `app/api/improvements/route.ts` para llamar ese endpoint desde servidor. Evita llamarlo directo desde el navegador si quieres mantener control de acceso y manejo de errores.

## Deploy en Vercel

1. Sube el proyecto a GitHub.
2. Importa el repo en Vercel.
3. Agrega las variables de entorno en Project Settings.
4. Ejecuta deploy.

No subas `.env.local` al repositorio.
