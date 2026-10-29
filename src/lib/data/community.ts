import { createClient } from "@/lib/supabase/server";
import { getOwnDisplayName } from "@/lib/data/leagues";
import {
  emptyReactions,
  isReactionEmoji,
  type ReactionSummary,
} from "@/lib/domain/community";

const WALL_POST_LIMIT = 50;
const WALL_GAME_LIMIT = 20;

export interface WallPost {
  id: string;
  userId: string;
  authorName: string;
  body: string;
  createdAt: string;
  reactions: ReactionSummary;
}

export interface GameComment {
  id: string;
  userId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface GameCreation {
  gameId: string;
  createdAt: string;
}

function summarizeReactions(
  rows: { emoji: string; user_id: string }[],
  viewerId: string
): ReactionSummary {
  const summary = emptyReactions();
  for (const row of rows) {
    if (!isReactionEmoji(row.emoji)) continue;
    summary.counts[row.emoji] += 1;
    if (row.user_id === viewerId) summary.mine.push(row.emoji);
  }
  return summary;
}

// Los perfiles solo son legibles por su dueño (RLS), así que el nombre de
// cada autor sale de su fila en `players` dentro de la liga.
async function getAuthorNames(leagueId: string, viewerId: string): Promise<Map<string, string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("players")
    .select("user_id, display_name")
    .eq("league_id", leagueId)
    .not("user_id", "is", null);

  const names = new Map<string, string>();
  for (const player of data ?? []) {
    if (player.user_id) names.set(player.user_id, player.display_name);
  }

  if (!names.has(viewerId)) {
    names.set(viewerId, (await getOwnDisplayName(viewerId)) ?? "Vos");
  }
  return names;
}

function authorNameOf(names: Map<string, string>, userId: string): string {
  return names.get(userId) ?? "Alguien de la liga";
}

export async function getWallPosts(leagueId: string, viewerId: string): Promise<WallPost[]> {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("league_posts")
    .select("id, user_id, body, created_at")
    .eq("league_id", leagueId)
    .order("created_at", { ascending: false })
    .limit(WALL_POST_LIMIT);

  if (!posts || posts.length === 0) return [];

  const [{ data: reactions }, names] = await Promise.all([
    supabase
      .from("reactions")
      .select("post_id, emoji, user_id")
      .in(
        "post_id",
        posts.map((p) => p.id)
      ),
    getAuthorNames(leagueId, viewerId),
  ]);

  const reactionsByPostId = new Map<string, { emoji: string; user_id: string }[]>();
  for (const r of reactions ?? []) {
    if (!r.post_id) continue;
    const list = reactionsByPostId.get(r.post_id) ?? [];
    list.push({ emoji: r.emoji, user_id: r.user_id });
    reactionsByPostId.set(r.post_id, list);
  }

  return posts.map((p) => ({
    id: p.id,
    userId: p.user_id,
    authorName: authorNameOf(names, p.user_id),
    body: p.body,
    createdAt: p.created_at,
    reactions: summarizeReactions(reactionsByPostId.get(p.id) ?? [], viewerId),
  }));
}

// Las partidas aparecen en el muro como avisos: se arman con el momento en
// que se cargaron (no con la fecha en que se jugaron).
export async function getRecentGameCreations(leagueId: string): Promise<GameCreation[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("games")
    .select("id, created_at")
    .eq("league_id", leagueId)
    .order("created_at", { ascending: false })
    .limit(WALL_GAME_LIMIT);

  return (data ?? []).map((g) => ({ gameId: g.id, createdAt: g.created_at }));
}

export async function getGameReactions(
  gameId: string,
  viewerId: string
): Promise<ReactionSummary> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reactions")
    .select("emoji, user_id")
    .eq("game_id", gameId);

  return summarizeReactions(data ?? [], viewerId);
}

export async function getGameComments(
  leagueId: string,
  gameId: string,
  viewerId: string
): Promise<GameComment[]> {
  const supabase = await createClient();

  const [{ data: comments }, names] = await Promise.all([
    supabase
      .from("game_comments")
      .select("id, user_id, body, created_at")
      .eq("game_id", gameId)
      .order("created_at", { ascending: true }),
    getAuthorNames(leagueId, viewerId),
  ]);

  return (comments ?? []).map((c) => ({
    id: c.id,
    userId: c.user_id,
    authorName: authorNameOf(names, c.user_id),
    body: c.body,
    createdAt: c.created_at,
  }));
}
