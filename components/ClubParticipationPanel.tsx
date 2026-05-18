import type { ClubParticipationItem } from "@/lib/metrics";
import { clampPercent, formatNumber, formatPercent } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";

export function ClubParticipationPanel({
  items
}: {
  items: ClubParticipationItem[];
}) {
  if (!items.length) {
    return (
      <EmptyState
        message="No hay datos para medir participación por club."
        title="Participación por club"
      />
    );
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-soft">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-ink-950">Participación por club</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Última semana completa: {items[0]?.lastCompletedWeekLabel}
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {items.map((item) => (
          <article className="rounded-lg border border-neutral-100 p-4" key={item.club}>
            <div className="flex items-center gap-3">
              <img alt="" className="h-12 w-12 object-contain" src={item.logo} />
              <div>
                <h3 className="font-semibold text-ink-950">{item.club}</h3>
                <p className="text-sm text-neutral-500">Meta semanal: {item.goal}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-neutral-500">Mejoras</p>
                <p className="mt-1 text-xl font-semibold text-ink-950">
                  {formatNumber(item.lastWeekCount)} / {formatNumber(item.goal)}
                </p>
                <p className="text-sm text-neutral-500">{formatPercent(item.goalCompliance)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Países activos</p>
                <p className="mt-1 text-xl font-semibold text-ink-950">
                  {formatNumber(item.activeTeams)} / {formatNumber(item.totalTeams)}
                </p>
                <p className="text-sm text-neutral-500">
                  {formatPercent(item.countryCompliance)}
                </p>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full"
                style={{
                  backgroundColor: item.color,
                  width: `${Math.max(4, clampPercent(item.countryCompliance))}%`
                }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
