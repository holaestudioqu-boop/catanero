import Link from "next/link";
import { AuthorAvatar } from "@/components/league/AuthorAvatar";
import { DeleteCommunityItemButton } from "@/components/league/DeleteCommunityItemButton";
import { ReactionBar } from "@/components/league/ReactionBar";
import { Card } from "@/components/ui/Card";
import { formatRelativeTime } from "@/lib/format";
import type { WallPost } from "@/lib/data/community";

export type WallItem =
  | { type: "post"; at: string; post: WallPost }
  | {
      type: "game";
      at: string;
      gameId: string;
      winnerName: string | null;
      playerCount: number;
    };

interface WallFeedProps {
  leagueId: string;
  slug: string;
  items: WallItem[];
  viewerId: string;
  isAdmin: boolean;
}

export function WallFeed({ leagueId, slug, items, viewerId, isAdmin }: WallFeedProps) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) =>
        item.type === "game" ? (
          <li key={`game-${item.gameId}`}>
            <GameEvent slug={slug} item={item} />
          </li>
        ) : (
          <li key={`post-${item.post.id}`}>
            <Card className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <AuthorAvatar name={item.post.authorName} />
                <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-medium text-foreground">
                    {item.post.authorName}
                  </span>
                  <span className="text-xs text-muted">
                    {formatRelativeTime(item.post.createdAt)}
                  </span>
                  {item.post.userId === viewerId || isAdmin ? (
                    <DeleteCommunityItemButton kind="post" id={item.post.id} slug={slug} />
                  ) : null}
                </div>
              </div>
              <p className="text-[15px] break-words whitespace-pre-wrap text-foreground">
                {item.post.body}
              </p>
              <ReactionBar
                leagueId={leagueId}
                slug={slug}
                target={{ kind: "post", id: item.post.id }}
                reactions={item.post.reactions}
              />
            </Card>
          </li>
        )
      )}
    </ul>
  );
}

function GameEvent({
  slug,
  item,
}: {
  slug: string;
  item: Extract<WallItem, { type: "game" }>;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-white/10 bg-carbon px-4 py-3 text-crema">
      <TrophyIcon />
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          Se cargó una partida
          {item.winnerName ? (
            <>
              : ganó <span className="font-semibold">{item.winnerName}</span>
            </>
          ) : null}
        </p>
        <p className="mt-0.5 text-xs text-crema/60">
          {item.playerCount} jugadores · {formatRelativeTime(item.at)} ·{" "}
          <Link
            href={`/league/${slug}/games/${item.gameId}`}
            className="font-medium text-dorado hover:underline"
          >
            Ver partida
          </Link>
        </p>
      </div>
    </div>
  );
}

function TrophyIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mt-0.5 shrink-0 text-dorado"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
