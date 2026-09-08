import Link from "next/link";
import { PositionBadge } from "@/components/ui/PositionBadge";
import { formatPercent, formatPointsPlain } from "@/lib/format";
import type { PlayerStats } from "@/lib/domain/types";

interface RankingTableProps {
  slug: string;
  stats: PlayerStats[];
  highlightPlayerId?: string;
}

export function RankingTable({ slug, stats, highlightPlayerId }: RankingTableProps) {
  return (
    <ol className="flex flex-col gap-2">
      {stats.map((player, index) => {
        const position = index + 1;
        const isMe = player.playerId === highlightPlayerId;
        return (
          <li key={player.playerId}>
            <Link
              href={`/league/${slug}/players/${player.playerId}`}
              className="flex items-center gap-3 rounded-[var(--radius-sm)] border border-border bg-surface px-4 py-3 transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <PositionBadge position={position} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium">
                  {player.displayName}
                  {isMe ? <span className="ml-2 text-xs font-normal text-muted">(vos)</span> : null}
                </p>
                <p className="text-xs text-muted">
                  {player.gamesPlayed} {player.gamesPlayed === 1 ? "partida" : "partidas"} ·{" "}
                  {formatPercent(player.winRate)} victorias
                </p>
              </div>
              <p className="text-lg font-semibold tabular-nums">
                {formatPointsPlain(player.rankingPoints)}
              </p>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
