import type { CountryRankingItem } from "@/lib/metrics";
import { formatNumber } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";

type CountryRankingPanelProps = {
  title: string;
  subtitle: string;
  items: CountryRankingItem[];
};

export function CountryRankingPanel({
  title,
  subtitle,
  items
}: CountryRankingPanelProps) {
  if (!items.length) {
    return <EmptyState message="No hay países con mejoras en esta vista." title={title} />;
  }

  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-soft">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-ink-950">{title}</h2>
        <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
      </div>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={`${item.club}-${item.name}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-xs font-semibold text-neutral-600">
                  {index + 1}
                </span>
                <img alt="" className="h-8 w-8 shrink-0 object-contain" src={item.logo} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-950">{item.name}</p>
                  <p className="text-xs font-medium" style={{ color: item.color }}>
                    {item.shortName}
                  </p>
                </div>
              </div>
              <span className="font-semibold text-ink-950">{formatNumber(item.count)}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full"
                style={{
                  backgroundColor: item.color,
                  width: `${Math.max(6, (item.count / max) * 100)}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
