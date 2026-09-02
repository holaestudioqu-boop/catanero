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
