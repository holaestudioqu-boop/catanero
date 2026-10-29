export function formatPoints(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  const isInteger = Number.isInteger(rounded);
  const formatted = rounded.toLocaleString("es-AR", {
    minimumFractionDigits: isInteger ? 0 : 1,
    maximumFractionDigits: 1,
    signDisplay: "negative",
  });
  return rounded > 0 ? `+${formatted}` : formatted;
}

export function formatPointsPlain(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  const isInteger = Number.isInteger(rounded);
  return rounded.toLocaleString("es-AR", {
    minimumFractionDigits: isInteger ? 0 : 1,
    maximumFractionDigits: 1,
  });
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatAverage(value: number, decimals = 2): string {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatDateShort(iso: string): string {
  const formatted = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
  return formatted.replace(".", "").toUpperCase();
}

export function formatDateLong(iso: string): string {
  const formatted = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
  return formatted;
}

export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const diffSeconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const abs = Math.abs(diffSeconds);
  const rtf = new Intl.RelativeTimeFormat("es-AR", { numeric: "auto" });

  if (abs < 60) return "recién";
  if (abs < 3600) return rtf.format(Math.round(diffSeconds / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSeconds / 3600), "hour");
  if (abs < 86400 * 7) return rtf.format(Math.round(diffSeconds / 86400), "day");
  return formatDateShort(iso);
}
