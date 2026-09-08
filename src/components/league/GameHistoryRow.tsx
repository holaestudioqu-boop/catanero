import Link from "next/link";
import { CatanPointsBadge } from "@/components/league/CatanPointsBadge";
import { formatDateShort } from "@/lib/format";
import type { Game, Player } from "@/lib/domain/types";

interface GameHistoryRowProps {
  slug: string;
  game: Game;
  players: Player[];
}

export function GameHistoryRow({ slug, game, players }: GameHistoryRowProps) {
  const winner = game.results.find((r) => r.position === 1);
  const winnerName =
    players.find((p) => p.id === winner?.playerId)?.displayName ?? "Alguien";

  return (
    <Link
      href={`/league/${slug}/games/${game.id}`}
      className="flex items-center gap-4 rounded-[var(--radius-sm)] bg-surface px-4 py-3.5 transition-colors hover:bg-white/5"
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium tracking-[0.08em] text-muted uppercase">
          {formatDateShort(game.playedAt)}
        </p>
        <p className="font-editorial mt-0.5 truncate text-xl text-foreground">
          {winnerName} ganó la partida
        </p>
      </div>
      {winner?.catanPoints != null ? <CatanPointsBadge points={winner.catanPoints} /> : null}
    </Link>
  );
}
