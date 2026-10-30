import { clsx } from "@/lib/clsx";
import type { PlayerStats } from "@/lib/domain/types";

interface LastPlacePodiumProps {
  /** Ya ordenado de más a menos veces último (ver `buildLastPlacePodium`). */
  podium: PlayerStats[];
}

// Posición en el podio -> altura y color de la columna. El que más veces
// salió último va al centro y más alto, como en un podio de verdad.
const columns = [
  { rank: 2, height: "h-20", bar: "bg-terracota text-crema" },
  { rank: 1, height: "h-28", bar: "bg-naranja text-white" },
  { rank: 3, height: "h-14", bar: "bg-crema/15 text-crema" },
] as const;

export function LastPlacePodium({ podium }: LastPlacePodiumProps) {
  if (podium.length === 0) return null;

  const visibleColumns = columns.filter((column) => podium[column.rank - 1]);

  return (
    <section
      aria-label="Podio de los que más veces salieron últimos"
      className="rounded-[var(--radius-lg)] border border-white/10 bg-carbon p-5 text-crema"
    >
      <p className="text-xs font-medium tracking-[0.08em] text-crema/60 uppercase">
        Cuadro de deshonor
      </p>
      <h2 className="font-editorial mt-1 text-2xl leading-tight">
        Los que más veces salieron últimos.
      </h2>

      <ol className="mt-5 flex items-end justify-center gap-2">
        {visibleColumns.map((column) => {
          const player = podium[column.rank - 1];
          return (
            <li key={player.playerId} className="flex min-w-0 flex-1 flex-col items-center">
              <p className="w-full truncate text-center text-sm font-medium">
                {player.displayName}
              </p>
              <p className="mb-2 text-[11px] text-crema/60">
                {player.lastPlaceCount} de {player.gamesPlayed} partidas
              </p>
              <div
                className={clsx(
                  "flex w-full flex-col items-center justify-center rounded-t-[var(--radius-sm)]",
                  column.height,
                  column.bar
                )}
              >
                <span className="font-editorial text-3xl leading-none">{column.rank}°</span>
                <span className="mt-1 text-[11px] opacity-80">
                  {player.lastPlaceCount} {player.lastPlaceCount === 1 ? "vez" : "veces"}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
