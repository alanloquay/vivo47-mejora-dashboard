import type {
  ParticipationMatrixRow,
  ParticipationMatrixWeek
} from "@/lib/metrics";
import { EmptyState } from "@/components/EmptyState";

export function ParticipationMatrix({
  rows,
  weeks,
  color
}: {
  rows: ParticipationMatrixRow[];
  weeks: ParticipationMatrixWeek[];
  color: string;
}) {
  if (!rows.length || !weeks.length) {
    return (
      <EmptyState
        message="No hay países suficientes para construir la matriz."
        title="Participación semanal"
      />
    );
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-soft">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-ink-950">Participación semanal por país</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Últimas 12 semanas completas. Verde indica que el país subió al menos una mejora.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 border-b border-neutral-200 bg-white pb-3 pr-4 text-left font-semibold text-ink-950">
                País
              </th>
              {weeks.map((week) => (
                <th
                  className="border-b border-neutral-200 px-2 pb-3 text-center text-xs font-semibold text-neutral-500"
                  key={week.weekKey}
                >
                  {week.weekLabel.replace(" 2026", "")}
                </th>
              ))}
              <th className="border-b border-neutral-200 pb-3 pl-4 text-right text-xs font-semibold text-neutral-500">
                Activas
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.team}>
                <td className="sticky left-0 z-10 border-b border-neutral-100 bg-white py-2 pr-4 font-medium text-ink-950">
                  {row.team}
                </td>
                {row.cells.map((cell) => (
                  <td className="border-b border-neutral-100 p-1.5" key={cell.weekKey}>
                    <div
                      className="mx-auto flex h-8 w-10 items-center justify-center rounded-md border text-xs font-semibold"
                      style={{
                        backgroundColor: cell.active ? color : "#f8fafc",
                        borderColor: cell.active ? color : "#e5e7eb",
                        color: cell.active ? "#ffffff" : "#9ca3af"
                      }}
                      title={
                        cell.active
                          ? `${cell.count} mejora(s) registradas`
                          : "Sin mejora registrada"
                      }
                    >
                      {cell.active ? cell.count : ""}
                    </div>
                  </td>
                ))}
                <td className="border-b border-neutral-100 py-2 pl-4 text-right font-semibold text-ink-950">
                  {row.activeWeeks}/12
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
