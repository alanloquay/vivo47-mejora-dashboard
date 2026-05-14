export function LoadingState() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          className="h-36 animate-pulse rounded-lg border border-neutral-200 bg-white shadow-soft"
          key={index}
        />
      ))}
    </div>
  );
}
