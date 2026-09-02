import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PositionBadge } from "@/components/ui/PositionBadge";
import { PointsPill } from "@/components/league/PointsPill";
import { calculateRankingPoints } from "@/lib/domain/scoring";
import { formatAverage, formatDateShort, formatPercent, formatPointsPlain } from "@/lib/format";
import type { Game, Player, PlayerStats } from "@/lib/domain/types";

interface PlayerProfileProps {
  slug: string;
  player: Player;
  stats: PlayerStats;
  recentGames: Game[];
}

export function PlayerProfile({ slug, player, stats, recentGames }: PlayerProfileProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link href={`/league/${slug}/players`} className="text-sm font-medium text-primary">
          ← Jugadores
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{player.displayName}</h1>
      </div>

      {stats.gamesPlayed === 0 ? (
        <EmptyState
          title={`${player.displayName} todavía no jugó ninguna partida.`}
          description="Sus estadísticas van a aparecer acá apenas registre una."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Puntos Catanero" value={formatPointsPlain(stats.rankingPoints)} />
            <StatCard label="Partidas jugadas" value={String(stats.gamesPlayed)} />
            <StatCard label="Victorias" value={String(stats.wins)} />
            <StatCard label="Win rate" value={formatPercent(stats.winRate)} />
            <StatCard label="Veces último" value={String(stats.lastPlaceCount)} />
            <StatCard label="Posición promedio" value={formatAverage(stats.averagePosition)} />
            {stats.averageCatanPoints != null ? (
              <StatCard
                label="Puntos CATAN promedio"
                value={formatAverage(stats.averageCatanPoints, 1)}
              />
            ) : null}
          </div>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Últimas partidas</h2>
            <ul className="flex flex-col gap-2">
              {recentGames.map((game) => {
                const result = game.results.find((r) => r.playerId === player.id)!;
                return (
                  <li key={game.id}>
                    <Link
                      href={`/league/${slug}/games/${game.id}`}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 transition-colors hover:bg-black/[.02] dark:hover:bg-white/[.03]"
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </Card>
  );
}
