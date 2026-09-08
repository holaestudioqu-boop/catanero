import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PositionBadge } from "@/components/ui/PositionBadge";
import { Sparkline } from "@/components/ui/Sparkline";
import { PointsPill } from "@/components/league/PointsPill";
import { calculateRankingPoints } from "@/lib/domain/scoring";
import { formatAverage, formatDateShort, formatPercent, formatPointsPlain } from "@/lib/format";
import type { Game, Player, PlayerStats } from "@/lib/domain/types";

interface PlayerProfileProps {
  slug: string;
  player: Player;
  stats: PlayerStats;
  position: number;
  recentGames: Game[];
  pointsHistory: number[];
}

export function PlayerProfile({
  slug,
  player,
  stats,
  position,
  recentGames,
  pointsHistory,
}: PlayerProfileProps) {
  const initial = player.displayName.charAt(0).toUpperCase();
  const isLeader = stats.gamesPlayed > 0 && position === 1;

  return (
    <div className="flex flex-col gap-6">
      <Link href={`/league/${slug}/players`} className="text-sm font-medium text-primary">
        ← Jugadores
      </Link>

      <div className="flex items-center gap-4">
        <span
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-semibold ${
            isLeader ? "bg-dorado text-carbon" : "bg-white/10 text-foreground"
          }`}
        >
          {initial}
        </span>
        <div>
          <h1 className="font-editorial text-3xl text-foreground sm:text-4xl">
            {player.displayName}
          </h1>
          {stats.gamesPlayed > 0 ? (
            <p className="mt-1 text-sm text-muted">
              #{position} · {formatPointsPlain(stats.rankingPoints)} puntos
            </p>
          ) : null}
        </div>
      </div>

      {stats.gamesPlayed === 0 ? (
        <EmptyState
          title="Todavía no empezó la historia."
          description={`Las estadísticas de ${player.displayName} van a aparecer acá apenas registre una partida.`}
        />
      ) : (
        <>
          <Card>
            <div className="grid grid-cols-4 gap-2 text-center">
              <HeroStat value={String(stats.gamesPlayed)} label="Partidas" />
              <HeroStat value={String(stats.wins)} label="Victorias" />
              <HeroStat value={formatPercent(stats.winRate)} label="Win rate" />
              <HeroStat value={formatAverage(stats.averagePosition)} label="Posición prom." />
            </div>

            {pointsHistory.length > 1 ? (
              <div className="mt-6">
                <p className="text-xs font-medium tracking-[0.08em] text-muted uppercase">
                  Evolución de puntos
                </p>
                <Sparkline values={pointsHistory} className="mt-2 h-16 w-full text-naranja" />
              </div>
            ) : null}
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Veces último" value={String(stats.lastPlaceCount)} />
            {stats.averageCatanPoints != null ? (
              <StatCard
                label="Puntos CATAN promedio"
                value={formatAverage(stats.averageCatanPoints, 1)}
              />
            ) : null}
          </div>

          <section className="flex flex-col gap-3">
            <h2 className="font-editorial text-2xl text-foreground">Últimas partidas</h2>
            <ul className="flex flex-col gap-2">
              {recentGames.map((game) => {
                const result = game.results.find((r) => r.playerId === player.id)!;
                return (
                  <li key={game.id}>
                    <Link
                      href={`/league/${slug}/games/${game.id}`}
                      className="flex items-center gap-3 rounded-[var(--radius-sm)] bg-surface px-4 py-3 transition-colors hover:bg-white/5"
                    >
                      <PositionBadge position={result.position} />
                      <span className="flex-1 text-sm text-muted">
                        {formatDateShort(game.playedAt)}
                      </span>
                      <PointsPill
                        value={calculateRankingPoints(result.position, game.results.length)}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-semibold text-foreground tabular-nums sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold text-foreground tabular-nums">{value}</p>
    </Card>
  );
}
