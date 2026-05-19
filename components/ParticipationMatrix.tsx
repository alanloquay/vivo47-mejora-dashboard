import type {
  ParticipationMatrixRow,
  ParticipationMatrixWeek
} from "@/lib/metrics";
import { EmptyState } from "@/components/EmptyState";

export function ParticipationMatrix({
  rows,
  weeks
}: {
  rows: ParticipationMatrixRow[];
  weeks: ParticipationMatrixWeek[];
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
              <th className="sticky left-0 z-10 border-b border-neutral-200 bg-white pb-2 pr-4 text-left font-semibold text-ink-950">
                País
              </th>
              {weeks.map((week) => (
                <th
                  className="border-b border-neutral-200 px-1.5 pb-2 text-center text-xs font-semibold text-neutral-500"
                  key={week.weekKey}
                >
                  {week.weekLabel.replace(" 2026", "")}
                </th>
              ))}
              <th className="border-b border-neutral-200 pb-2 pl-4 text-right text-xs font-semibold text-neutral-500">
                Activas
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.team}>
                <td className="sticky left-0 z-10 border-b border-neutral-100 bg-white py-1.5 pr-4 font-medium text-ink-950">
                  {row.team}
                </td>
                {row.cells.map((cell) => (
                  <td className="border-b border-neutral-100 p-1" key={cell.weekKey}>
                    <div
                      className="mx-auto h-5 w-8 rounded-sm border"
                      style={{
                        backgroundColor: cell.active ? "#16a34a" : "#ffffff",
                        borderColor: cell.active ? "#16a34a" : "#d1d5db"
                      }}
                      title={
                        cell.active
                          ? `${cell.count} mejora(s) registradas`
                          : "Sin mejora registrada"
                      }
                    />
                  </td>
                ))}
                <td className="border-b border-neutral-100 py-1.5 pl-4 text-right font-semibold text-ink-950">
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
