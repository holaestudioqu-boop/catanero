import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { CatanPointsBadge } from "@/components/league/CatanPointsBadge";
import { EditGameDateControl } from "@/components/league/EditGameDateControl";
import { PointsPill } from "@/components/league/PointsPill";
import { calculateRankingPoints } from "@/lib/domain/scoring";
import { formatDateLong } from "@/lib/format";
import type { Game, Player } from "@/lib/domain/types";

interface GameDetailProps {
  slug: string;
  game: Game;
  players: Player[];
  canEditDate: boolean;
}

export function GameDetail({ slug, game, players, canEditDate }: GameDetailProps) {
  const nameOf = (playerId: string) =>
    players.find((p) => p.id === playerId)?.displayName ?? playerId;
  const numberOfPlayers = game.results.length;
  const sorted = [...game.results].sort((a, b) => a.position - b.position);
  const winner = sorted.find((r) => r.position === 1);

  return (
    <div className="flex flex-col gap-4">
      <Link href={`/league/${slug}/games`} className="text-sm font-medium text-primary">
        ← Partidas
      </Link>

      <Card className="flex flex-col gap-6">
        <div>
          <p className="text-xs font-medium tracking-[0.08em] text-muted uppercase">
            {formatDateLong(game.playedAt)} · {numberOfPlayers} jugadores
          </p>
          {canEditDate ? (
            <div className="mt-2">
              <EditGameDateControl
                gameId={game.id}
                slug={slug}
                currentDate={game.playedAt.slice(0, 10)}
              />
            </div>
          ) : null}
          <div className="mt-2 flex items-center justify-between gap-4">
            <h1 className="font-editorial text-2xl text-foreground sm:text-3xl">
              {nameOf(winner?.playerId ?? "")} ganó la partida
            </h1>
            {winner?.catanPoints != null ? (
              <CatanPointsBadge points={winner.catanPoints} size="md" />
            ) : null}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex px-1 pb-2 text-xs font-medium tracking-[0.08em] text-muted uppercase">
            <span className="flex-1">Jugador</span>
            <span className="w-16 text-right">Puntos</span>
            <span className="w-20 text-right">Ranking</span>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {sorted.map((result) => (
              <div key={result.playerId} className="flex items-center gap-2 px-1 py-3">
                <span className="flex-1 truncate text-[15px] font-medium text-foreground">
                  {result.position}° {nameOf(result.playerId)}
                </span>
                <span className="w-16 text-right text-sm text-muted tabular-nums">
                  {result.catanPoints ?? "—"}
                </span>
                <span className="w-20 text-right">
                  <PointsPill
                    value={calculateRankingPoints(result.position, numberOfPlayers)}
                  />
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted">
          Puntos calculados automáticamente según una partida de {numberOfPlayers} jugadores.
        </p>
      </Card>
    </div>
  );
}
