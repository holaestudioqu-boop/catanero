import { clsx } from "@/lib/clsx";
import { formatPoints } from "@/lib/format";

export function PointsPill({ value, className }: { value: number; className?: string }) {
  const tone =
    value > 0 ? "text-accent" : value < 0 ? "text-danger" : "text-muted";
  return (
    <span className={clsx("text-sm font-semibold tabular-nums", tone, className)}>
      {formatPoints(value)}
    </span>
  );
}
