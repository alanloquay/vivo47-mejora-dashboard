import type { ActivityDay } from "@/lib/metrics";
import { formatNumber } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";

export function ActivityHeatmap({ data }: { data: ActivityDay[] }) {
  if (!data.length) {
    return (
      <EmptyState
        message="No hay fechas validas para medir actividad."
        title="Sin actividad diaria"
      />
    );
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-soft">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-ink-950">Actividad por día</h2>
        <p className="mt-1 text-sm text-neutral-500">Capturas registradas por día de semana.</p>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {data.map((item) => (
          <div className="text-center" key={item.day}>
            <div
              className="flex aspect-square items-center justify-center rounded-lg text-sm font-semibold"
              style={{
                backgroundColor: `rgba(18, 185, 106, ${0.14 + item.intensity * 0.72})`,
                color: item.intensity > 0.55 ? "#ffffff" : "#0a4d31"
              }}
            >
              {formatNumber(item.count)}
            </div>
            <p className="mt-2 text-xs font-medium text-neutral-500">{item.day}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
