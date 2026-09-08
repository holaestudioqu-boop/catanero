import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { PointsPill } from "@/components/league/PointsPill";
import { calculateRankingPoints } from "@/lib/domain/scoring";
import { formatDateShort } from "@/lib/format";
import type { Game, Player } from "@/lib/domain/types";

interface GameSummaryCardProps {
  slug: string;
  game: Game;
  players: Player[];
}

export function GameSummaryCard({ slug, game, players }: GameSummaryCardProps) {
  const nameOf = (playerId: string) =>
    players.find((p) => p.id === playerId)?.displayName ?? playerId;
  const numberOfPlayers = game.results.length;
  const sorted = [...game.results].sort((a, b) => a.position - b.position);

  return (
    <Link href={`/league/${slug}/games/${game.id}`}>
      <Card className="transition-colors hover:bg-white/5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
          {formatDateShort(game.playedAt)}
        </p>
        <ul className="flex flex-col gap-1.5">
          {sorted.map((result) => (
            <li key={result.playerId} className="flex items-center justify-between text-sm">
              <span className="text-foreground">
                {result.position}° {nameOf(result.playerId)}
                {result.catanPoints != null ? (
                  <span className="text-muted"> — {result.catanPoints} pts</span>
                ) : null}
              </span>
              <PointsPill value={calculateRankingPoints(result.position, numberOfPlayers)} />
            </li>
          ))}
        </ul>
      </Card>
    </Link>
  );
}
