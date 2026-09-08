import type { HTMLAttributes } from "react";
import { clsx } from "@/lib/clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-[var(--radius-lg)] border border-border bg-surface p-4",
        className
      )}
      {...props}
    />
  );
}
