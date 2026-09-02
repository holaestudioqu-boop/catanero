type ClassValue = string | number | false | null | undefined;

/** Utilidad mínima para combinar clases condicionales, sin dependencias externas. */
export function clsx(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
