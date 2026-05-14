import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";

type KpiCardProps = {
  label: string;
  value: string;
  helper?: string;
  icon: LucideIcon;
  tone?: "green" | "dark" | "muted";
};

const toneClasses = {
  green: "bg-vivo-600 text-white",
  dark: "bg-ink-950 text-white",
  muted: "bg-neutral-100 text-neutral-700"
};

export function KpiCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "muted"
}: KpiCardProps) {
  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-neutral-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-normal text-ink-950">
            {value}
          </p>
        </div>
        <div className={clsx("rounded-lg p-2.5", toneClasses[tone])}>
          <Icon aria-hidden className="h-5 w-5" />
        </div>
      </div>
      {helper ? <p className="mt-4 text-sm text-neutral-500">{helper}</p> : null}
    </article>
  );
}
