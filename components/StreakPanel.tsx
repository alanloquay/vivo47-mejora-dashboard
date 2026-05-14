import type { StreakItem } from "@/lib/metrics";
import { clampPercent, formatPercent } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";

export function StreakPanel({ streaks }: { streaks: StreakItem[] }) {
  if (!streaks.length) {
    return (
      <EmptyState
        message="No hay semanas completas para calcular rachas."
        title="Sin rachas disponibles"
      />
    );
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-soft">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-ink-950">Racha semanal por club</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Semanas completas consecutivas cumpliendo meta.
        </p>
      </div>
      <div className="space-y-4">
        {streaks.map((item) => {
          const currentWidth = clampPercent(item.currentWeekCompliance);
          return (
            <div className="rounded-lg border border-neutral-100 p-4" key={item.club}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <h3 className="font-semibold text-ink-950">{item.club}</h3>
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">
                    Meta semanal: {item.goal ?? "sin meta fija"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-ink-950">
                    {item.streak ?? "-"}
                  </p>
                  <p className="text-xs uppercase tracking-normal text-neutral-500">
                    semanas
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-neutral-500">Esta semana</p>
                  <p className="mt-1 font-semibold text-ink-950">
                    {item.currentWeekCount}
                    {item.goal ? ` / ${item.goal}` : ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Cumplidas</p>
                  <p className="mt-1 font-semibold text-ink-950">{item.fulfilledWeeks}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">No cumplidas</p>
                  <p className="mt-1 font-semibold text-ink-950">{item.missedWeeks}</p>
                </div>
              </div>
              {item.goal ? (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>Avance semanal</span>
                    <span>{formatPercent(item.currentWeekCompliance)}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-vivo-600"
                      style={{ width: `${Math.max(4, currentWidth)}%` }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
