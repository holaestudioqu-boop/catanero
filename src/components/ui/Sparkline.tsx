interface SparklineProps {
  values: number[];
  className?: string;
}

/** Línea de evolución simple; valores ya vienen acumulados desde el server component. */
export function Sparkline({ values, className }: SparklineProps) {
  if (values.length < 2) return null;

  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const range = max - min || 1;

  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return { x, y };
  });

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={className}>
      <polyline
        points={points.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {points.map((p, index) => (
        <circle key={index} cx={p.x} cy={p.y} r={2.5} fill="currentColor" />
      ))}
    </svg>
  );
}
