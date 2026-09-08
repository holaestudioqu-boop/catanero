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

const barColors = ["bg-dorado", "bg-naranja", "bg-terracota", "bg-arena"];

export function StatsView({
  slug,
  stats,
  gamesPlayed,
}: {
  slug: string;
  stats: PlayerStats[];
  gamesPlayed: number;
}) {
  const withGames = stats.filter((s) => s.gamesPlayed > 0);

  if (withGames.length === 0) {
    return (
      <EmptyState
        title="Todavía no hay estadísticas."
        description="Se calculan automáticamente apenas se registren partidas."
      />
    );
  }

  const mostWins = topBy(stats, (s) => s.wins)!;
  const bestWinRate = topBy(stats, (s) => s.winRate)!;
  const mostLastPlaces = topBy(stats, (s) => s.lastPlaceCount);
  const bestAveragePosition = topBy(stats, (s) => s.averagePosition, "min");

  const byWins = [...withGames].sort((a, b) => b.wins - a.wins).slice(0, 6);
  const maxWins = Math.max(...byWins.map((s) => s.wins), 1);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-editorial text-3xl text-foreground">Estadísticas</h1>

      <Card>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <HeroStat value={String(gamesPlayed)} label="Partidas" />
          <HeroStat value={String(withGames.length)} label="Jugadores activos" />
          <HeroStat value={mostWins.displayName} label="Más ganador/a" gold />
          <HeroStat value={formatPercent(bestWinRate.winRate)} label="Mejor win rate" />
        </div>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="font-editorial text-2xl text-foreground">Victorias por jugador</h2>
        <Card className="flex flex-col gap-3">
          {byWins.map((player, index) => (
            <Link
              key={player.playerId}
              href={`/league/${slug}/players/${player.playerId}`}
              className="flex items-center gap-3"
            >
              <span className="w-20 shrink-0 truncate text-sm text-foreground">
                {player.displayName}
              </span>
              <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <span
                  className={`block h-full rounded-full ${barColors[index] ?? "bg-arena"}`}
                  style={{ width: `${Math.max((player.wins / maxWins) * 100, 4)}%` }}
                />
              </span>
              <span className="w-6 shrink-0 text-right text-sm text-muted tabular-nums">
                {player.wins}
              </span>
            </Link>
          ))}
        </Card>
      </section>

      {mostLastPlaces || bestAveragePosition ? (
        <section className="flex flex-col gap-2">
          {bestAveragePosition ? (
            <RecordRow
              slug={slug}
              label="Mejor posición promedio"
              player={bestAveragePosition}
              value={formatAverage(bestAveragePosition.averagePosition)}
            />
          ) : null}
          {mostLastPlaces ? (
            <RecordRow
              slug={slug}
              label="Más veces último"
              player={mostLastPlaces}
              value={String(mostLastPlaces.lastPlaceCount)}
            />
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function HeroStat({ value, label, gold }: { value: string; label: string; gold?: boolean }) {
  return (
    <div>
      <p
        className={`truncate text-xl font-semibold tabular-nums sm:text-2xl ${gold ? "text-dorado" : "text-foreground"}`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}

function RecordRow({
  slug,
  label,
  player,
  value,
}: {
  slug: string;
  label: string;
  player: PlayerStats;
  value: string;
}) {
  return (
    <Card className="flex items-center justify-between">
      <div>
        <p className="text-xs text-muted">{label}</p>
        <Link
          href={`/league/${slug}/players/${player.playerId}`}
          className="text-[15px] font-medium text-primary"
        >
          {player.displayName}
        </Link>
      </div>
      <p className="text-lg font-semibold text-foreground tabular-nums">{value}</p>
    </Card>
  );
}
