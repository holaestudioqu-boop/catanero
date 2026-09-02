import { clsx } from "@/lib/clsx";

const styles: Record<number, string> = {
  1: "bg-[var(--gold-bg)] text-[var(--gold)]",
  2: "bg-[var(--silver-bg)] text-[var(--silver)]",
  3: "bg-[var(--bronze-bg)] text-[var(--bronze)]",
};

export function PositionBadge({ position }: { position: number }) {
  return (
    <span
      className={clsx(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
        styles[position] ?? "bg-black/[.05] text-muted dark:bg-white/[.08]"
      )}
    >
      {position}°
    </span>
  );
}
