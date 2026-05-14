export function formatNumber(value: number) {
  return new Intl.NumberFormat("es-MX").format(value);
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Sin meta";
  }

  return `${Math.round(value * 100)}%`;
}

export function clampPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value * 100)));
}
