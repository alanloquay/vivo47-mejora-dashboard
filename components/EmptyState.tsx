import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center shadow-soft">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
        <Inbox aria-hidden className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-ink-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-neutral-500">{message}</p>
    </div>
  );
}
