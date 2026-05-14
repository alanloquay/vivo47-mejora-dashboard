import type { Improvement } from "@/types/improvement";
import { EmptyState } from "@/components/EmptyState";

export function LatestImprovementsTable({ records }: { records: Improvement[] }) {
  if (!records.length) {
    return (
      <EmptyState
        message="No hay registros recientes con los filtros actuales."
        title="Sin últimas mejoras"
      />
    );
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-soft">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-ink-950">Últimas mejoras registradas</h2>
        <p className="mt-1 text-sm text-neutral-500">Registros más recientes del formulario.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-normal text-neutral-500">
              <th className="border-b border-neutral-200 pb-3 pr-4 font-semibold">Fecha</th>
              <th className="border-b border-neutral-200 pb-3 pr-4 font-semibold">Club</th>
              <th className="border-b border-neutral-200 pb-3 pr-4 font-semibold">Equipo</th>
              <th className="border-b border-neutral-200 pb-3 pr-4 font-semibold">
                Colaborador
              </th>
              <th className="border-b border-neutral-200 pb-3 pr-4 font-semibold">
                Mejora
              </th>
              <th className="border-b border-neutral-200 pb-3 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr className="align-top" key={record.id}>
                <td className="border-b border-neutral-100 py-4 pr-4 text-neutral-600">
                  {record.date}
                </td>
                <td className="border-b border-neutral-100 py-4 pr-4 font-medium text-ink-950">
                  {record.club}
                </td>
                <td className="border-b border-neutral-100 py-4 pr-4 text-neutral-600">
                  {record.team ?? "-"}
                </td>
                <td className="border-b border-neutral-100 py-4 pr-4 text-neutral-600">
                  {record.collaborator ?? "-"}
                </td>
                <td className="max-w-sm border-b border-neutral-100 py-4 pr-4 text-neutral-700">
                  <span className="line-clamp-2">
                    {record.opportunity ?? record.description ?? "-"}
                  </span>
                  {record.category ? (
                    <span className="mt-2 inline-flex rounded-lg bg-vivo-50 px-2 py-1 text-xs font-medium text-vivo-800">
                      {record.category}
                    </span>
                  ) : null}
                </td>
                <td className="border-b border-neutral-100 py-4 text-neutral-600">
                  {record.status ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
