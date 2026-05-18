import type { CountryStreakItem } from "@/lib/metrics";
import { EmptyState } from "@/components/EmptyState";

export function CountryStreakRanking({ items }: { items: CountryStreakItem[] }) {
  if (!items.length) {
    return (
      <EmptyState
        message="Aún no hay países con racha activa en semanas completas."
        title="Top rachas de países"
      />
    );
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-soft">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-ink-950">Top 5 rachas de países</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Semanas completas consecutivas subiendo al menos una mejora.
        </p>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            className="flex items-center justify-between gap-4 rounded-lg border border-neutral-100 p-3"
            key={`${item.club}-${item.team}`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-950 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <img alt="" className="h-9 w-9 shrink-0 object-contain" src={item.logo} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink-950">{item.team}</p>
                <p className="text-xs font-medium" style={{ color: item.color }}>
                  {item.shortName}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-ink-950">{item.streak}</p>
              <p className="text-xs uppercase tracking-normal text-neutral-500">semanas</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
