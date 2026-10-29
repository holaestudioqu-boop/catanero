import { AuthorAvatar } from "@/components/league/AuthorAvatar";
import { CommentForm } from "@/components/league/CommentForm";
import { DeleteCommunityItemButton } from "@/components/league/DeleteCommunityItemButton";
import { formatRelativeTime } from "@/lib/format";
import type { GameComment } from "@/lib/data/community";

interface CommentSectionProps {
  leagueId: string;
  gameId: string;
  slug: string;
  comments: GameComment[];
  viewerId: string;
  isAdmin: boolean;
}

export function CommentSection({
  leagueId,
  gameId,
  slug,
  comments,
  viewerId,
  isAdmin,
}: CommentSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-medium tracking-[0.08em] text-muted uppercase">
        Comentarios · {comments.length}
      </p>

      {comments.length === 0 ? (
        <p className="text-sm text-muted">Todavía nadie comentó. Tirá el primero.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {comments.map((comment) => (
            <li key={comment.id} className="flex items-start gap-3">
              <AuthorAvatar name={comment.authorName} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-medium text-foreground">{comment.authorName}</span>
                  <span className="text-xs text-muted">{formatRelativeTime(comment.createdAt)}</span>
                  {comment.userId === viewerId || isAdmin ? (
                    <DeleteCommunityItemButton kind="comment" id={comment.id} slug={slug} />
                  ) : null}
                </div>
                <p className="mt-0.5 text-[15px] break-words whitespace-pre-wrap text-foreground">
                  {comment.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CommentForm leagueId={leagueId} gameId={gameId} slug={slug} />
    </div>
  );
}
