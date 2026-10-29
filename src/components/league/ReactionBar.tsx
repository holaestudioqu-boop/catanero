"use client";

import { useOptimistic, useTransition } from "react";
import { toggleReaction } from "@/app/league/[slug]/community-actions";
import { clsx } from "@/lib/clsx";
import {
  REACTION_EMOJIS,
  type ReactionEmoji,
  type ReactionSummary,
  type ReactionTarget,
} from "@/lib/domain/community";

interface ReactionBarProps {
  leagueId: string;
  slug: string;
  target: ReactionTarget;
  reactions: ReactionSummary;
}

function applyToggle(current: ReactionSummary, emoji: ReactionEmoji): ReactionSummary {
  const reacted = current.mine.includes(emoji);
  return {
    counts: { ...current.counts, [emoji]: Math.max(0, current.counts[emoji] + (reacted ? -1 : 1)) },
    mine: reacted ? current.mine.filter((e) => e !== emoji) : [...current.mine, emoji],
  };
}

export function ReactionBar({ leagueId, slug, target, reactions }: ReactionBarProps) {
  const [optimistic, addOptimistic] = useOptimistic(reactions, applyToggle);
  const [, startTransition] = useTransition();

  function toggle(emoji: ReactionEmoji) {
    startTransition(async () => {
      addOptimistic(emoji);
      await toggleReaction(leagueId, slug, target, emoji);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {REACTION_EMOJIS.map((emoji) => {
        const count = optimistic.counts[emoji];
        const reacted = optimistic.mine.includes(emoji);
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => toggle(emoji)}
            aria-pressed={reacted}
            aria-label={`Reaccionar con ${emoji}`}
            className={clsx(
              "inline-flex min-h-8 items-center gap-1 rounded-full border px-2.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              reacted
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border text-muted hover:bg-black/[.03] dark:hover:bg-white/[.04]"
            )}
          >
            <span className="text-sm leading-none">{emoji}</span>
            {count > 0 ? <span className="tabular-nums">{count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
