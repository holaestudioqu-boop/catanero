import type { ReactNode } from "react";
import { clsx } from "@/lib/clsx";

interface HexagonProps {
  children: ReactNode;
  fillClassName?: string;
  textClassName?: string;
  strokeClassName?: string;
  size?: "sm" | "md";
}

/** El hexágono es la firma gráfica del sistema: posición, badges, puntos. */
export function Hexagon({
  children,
  fillClassName = "fill-none",
  textClassName = "text-foreground",
  strokeClassName,
  size = "sm",
}: HexagonProps) {
  const dimension = size === "sm" ? "h-9 w-9" : "h-14 w-14";
  const textSize = size === "sm" ? "text-[13px]" : "text-lg";

  return (
    <span className={clsx("relative inline-flex shrink-0 items-center justify-center", dimension)}>
      <svg
        viewBox="0 0 100 100"
        className={clsx("absolute inset-0 h-full w-full", strokeClassName)}
      >
        <polygon
          points="50,4 94,27 94,73 50,96 6,73 6,27"
          className={fillClassName}
          stroke={strokeClassName ? "currentColor" : "none"}
          strokeWidth={strokeClassName ? 4 : 0}
        />
      </svg>
      <span className={clsx("relative font-semibold", textSize, textClassName)}>{children}</span>
    </span>
  );
}
