"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  isReactionEmoji,
  MAX_MESSAGE_LENGTH,
  type ReactionTarget,
} from "@/lib/domain/community";

export interface CommunityActionResult {
  error: string | null;
}

const SESSION_EXPIRED = "Tu sesión expiró. Volvé a iniciar sesión.";

function validateBody(raw: string): { body: string } | { error: string } {
  const body = raw.trim();
  if (!body) return { error: "Escribí un mensaje." };
  if (body.length > MAX_MESSAGE_LENGTH) {
    return { error: `El mensaje no puede pasar de ${MAX_MESSAGE_LENGTH} caracteres.` };
  }
  return { body };
}

// Mensajes, comentarios y reacciones se ven en el muro, el detalle de la
// partida y el inicio de la liga; se revalida todo el árbol de la liga.
function revalidateLeague(slug: string) {
  revalidatePath(`/league/${slug}`, "layout");
}

export async function createPost(
  leagueId: string,
  slug: string,
  rawBody: string
): Promise<CommunityActionResult> {
  const checked = validateBody(rawBody);
  if ("error" in checked) return { error: checked.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: SESSION_EXPIRED };

  const { error } = await supabase
    .from("league_posts")
    .insert({ league_id: leagueId, user_id: user.id, body: checked.body });

  if (error) return { error: "No se pudo publicar. Probá de nuevo." };

  revalidateLeague(slug);
  return { error: null };
}

export async function deletePost(postId: string, slug: string): Promise<CommunityActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("league_posts").delete().eq("id", postId);

  if (error) return { error: "No se pudo borrar el mensaje." };

  revalidateLeague(slug);
  return { error: null };
}

export async function addComment(
  leagueId: string,
  gameId: string,
  slug: string,
  rawBody: string
): Promise<CommunityActionResult> {
  const checked = validateBody(rawBody);
  if ("error" in checked) return { error: checked.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: SESSION_EXPIRED };

  const { error } = await supabase.from("game_comments").insert({
    league_id: leagueId,
    game_id: gameId,
    user_id: user.id,
    body: checked.body,
  });

  if (error) return { error: "No se pudo enviar el comentario. Probá de nuevo." };

  revalidateLeague(slug);
  return { error: null };
}

export async function deleteComment(
  commentId: string,
  slug: string
): Promise<CommunityActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("game_comments").delete().eq("id", commentId);

  if (error) return { error: "No se pudo borrar el comentario." };

  revalidateLeague(slug);
  return { error: null };
}

// Tocar un emoji lo pone; volver a tocar el mismo lo saca.
export async function toggleReaction(
  leagueId: string,
  slug: string,
  target: ReactionTarget,
  emoji: string
): Promise<CommunityActionResult> {
  if (!isReactionEmoji(emoji)) return { error: "Reacción inválida." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: SESSION_EXPIRED };

  const lookup = supabase
    .from("reactions")
    .select("id")
    .eq("user_id", user.id)
    .eq("emoji", emoji);
  const { data: existing } = await (target.kind === "post"
    ? lookup.eq("post_id", target.id)
    : lookup.eq("game_id", target.id)
  ).maybeSingle();

  if (existing) {
    const { error } = await supabase.from("reactions").delete().eq("id", existing.id);
    if (error) return { error: "No se pudo quitar la reacción." };
  } else {
    const { error } = await supabase.from("reactions").insert(
      target.kind === "post"
        ? { league_id: leagueId, user_id: user.id, emoji, post_id: target.id }
        : { league_id: leagueId, user_id: user.id, emoji, game_id: target.id }
    );
    if (error) return { error: "No se pudo reaccionar." };
  }

  revalidateLeague(slug);
  return { error: null };
}
