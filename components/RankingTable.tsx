import type { RankingItem } from "@/lib/metrics";
import { formatNumber } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";

type RankingTableProps = {
  title: string;
  subtitle: string;
  items: RankingItem[];
  emptyTitle: string;
};

export function RankingTable({
  title,
  subtitle,
  items,
  emptyTitle
}: RankingTableProps) {
  if (!items.length) {
    return <EmptyState message="La columna no existe o no tiene valores." title={emptyTitle} />;
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
          <div key={item.name}>
            <div className="flex items-center justify-between gap-4 text-sm">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-xs font-semibold text-neutral-600">
                  {index + 1}
                </span>
                <span className="truncate font-medium text-ink-950">{item.name}</span>
              </div>
              <span className="font-semibold text-vivo-700">{formatNumber(item.count)}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-vivo-600"
                style={{ width: `${Math.max(6, (item.count / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
