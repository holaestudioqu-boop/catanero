import { clsx } from "@/lib/clsx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:opacity-90 active:opacity-80 disabled:opacity-40",
  secondary:
    "bg-surface text-foreground border border-border hover:bg-black/[.03] dark:hover:bg-white/[.04] disabled:opacity-40",
  ghost:
    "bg-transparent text-foreground hover:bg-black/[.04] dark:hover:bg-white/[.06] disabled:opacity-40",
  danger:
    "bg-danger text-white hover:opacity-90 active:opacity-80 disabled:opacity-40",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  fullWidth = false,
  className?: string
): string {
  return clsx(
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-control)] px-6 text-[15px] font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:cursor-not-allowed",
    fullWidth && "w-full",
    variantClasses[variant],
    className
  );
}
