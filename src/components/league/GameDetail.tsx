import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { PositionBadge } from "@/components/ui/PositionBadge";
import { PointsPill } from "@/components/league/PointsPill";
import { calculateRankingPoints } from "@/lib/domain/scoring";
import { formatDateLong } from "@/lib/format";
import type { Game, Player } from "@/lib/domain/types";

interface GameDetailProps {
  slug: string;
  game: Game;
  players: Player[];
}

export function GameDetail({ slug, game, players }: GameDetailProps) {
  const nameOf = (playerId: string) =>
    players.find((p) => p.id === playerId)?.displayName ?? playerId;
  const numberOfPlayers = game.results.length;
  const sorted = [...game.results].sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link href={`/league/${slug}/games`} className="text-sm font-medium text-primary">
          ← Partidas
        </Link>
        <h1 className="mt-2 text-xl font-semibold">{formatDateLong(game.playedAt)}</h1>
        <p className="text-sm text-muted">{numberOfPlayers} jugadores</p>
      </div>

      <Card className="flex flex-col divide-y divide-border">
        {sorted.map((result) => (
          <div key={result.playerId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <PositionBadge position={result.position} />
            <div className="flex-1">
              <p className="text-[15px] font-medium">{nameOf(result.playerId)}</p>
              {result.catanPoints != null ? (
                <p className="text-xs text-muted">{result.catanPoints} puntos de CATAN</p>
              ) : null}
            </div>
            <PointsPill value={calculateRankingPoints(result.position, numberOfPlayers)} />
          </div>
        ))}
      </Card>
    </div>
  );
}
