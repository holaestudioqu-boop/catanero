import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatAverage, formatPercent } from "@/lib/format";
import type { PlayerStats } from "@/lib/domain/types";

function topBy(
  stats: PlayerStats[],
  selector: (s: PlayerStats) => number,
  direction: "max" | "min" = "max"
): PlayerStats | null {
  const withGames = stats.filter((s) => s.gamesPlayed > 0);
  if (withGames.length === 0) return null;
  return withGames.reduce((best, current) =>
    direction === "max"
      ? selector(current) > selector(best)
        ? current
        : best
      : selector(current) < selector(best)
        ? current
        : best
  );
}

export function StatsView({ slug, stats }: { slug: string; stats: PlayerStats[] }) {
  const hasEnoughData = stats.some((s) => s.gamesPlayed > 0);

  if (!hasEnoughData) {
    return (
      <EmptyState
        title="Todavía no hay estadísticas."
        description="Se calculan automáticamente apenas se registren partidas."
      />
    );
  }

  const mostWins = topBy(stats, (s) => s.wins);
  const bestWinRate = topBy(stats, (s) => s.winRate);
  const mostGames = topBy(stats, (s) => s.gamesPlayed);
  const mostLastPlaces = topBy(stats, (s) => s.lastPlaceCount);
  const bestAveragePosition = topBy(stats, (s) => s.averagePosition, "min");

  const rows: { label: string; player: PlayerStats | null; value: string }[] = [
    { label: "Más ganador", player: mostWins, value: mostWins ? `${mostWins.wins} victorias` : "" },
    {
      label: "Mejor win rate",
      player: bestWinRate,
      value: bestWinRate ? formatPercent(bestWinRate.winRate) : "",
    },
    {
      label: "Más partidas jugadas",
      player: mostGames,
      value: mostGames ? String(mostGames.gamesPlayed) : "",
    },
    {
      label: "Más veces último",
      player: mostLastPlaces,
      value: mostLastPlaces ? String(mostLastPlaces.lastPlaceCount) : "",
    },
    {
      label: "Mejor posición promedio",
      player: bestAveragePosition,
      value: bestAveragePosition ? formatAverage(bestAveragePosition.averagePosition) : "",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Estadísticas</h1>
      <div className="flex flex-col gap-2">
        {rows
          .filter((row) => row.player)
          .map((row) => (
            <Card key={row.label} className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted">{row.label}</p>
                <Link
                  href={`/league/${slug}/players/${row.player!.playerId}`}
                  className="text-[15px] font-medium text-primary"
                >
                  {row.player!.displayName}
                </Link>
              </div>
              <p className="text-lg font-semibold tabular-nums">{row.value}</p>
            </Card>
          ))}
      </div>
    </div>
  );
}
