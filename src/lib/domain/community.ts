export const REACTION_EMOJIS = ["👍", "🔥", "😂", "👏"] as const;

export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

export const MAX_MESSAGE_LENGTH = 500;

export interface ReactionSummary {
  counts: Record<ReactionEmoji, number>;
  mine: ReactionEmoji[];
}

export interface ReactionTarget {
  kind: "post" | "game";
  id: string;
}

export function isReactionEmoji(value: string): value is ReactionEmoji {
  return (REACTION_EMOJIS as readonly string[]).includes(value);
}

export function emptyReactions(): ReactionSummary {
  return {
    counts: { "👍": 0, "🔥": 0, "😂": 0, "👏": 0 },
    mine: [],
  };
}
