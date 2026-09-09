"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { LeagueRole } from "@/lib/supabase/types";

export interface AddPlayerState {
  error: string | null;
}

export async function addPlayer(
  leagueId: string,
  slug: string,
  _prevState: AddPlayerState,
  formData: FormData
): Promise<AddPlayerState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!displayName) {
    return { error: "Ingresá un nombre." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("players")
    .insert({ league_id: leagueId, display_name: displayName });

  if (error) {
    return { error: "No se pudo agregar el jugador. ¿Tenés permisos de administrador?" };
  }

  revalidatePath(`/league/${slug}/players`);
  return { error: null };
}

export interface DeletePlayerState {
  error: string | null;
}

export async function deletePlayer(
  playerId: string,
  slug: string,
  _prevState: DeletePlayerState,
  _formData: FormData
): Promise<DeletePlayerState> {
  const supabase = await createClient();
  const { error } = await supabase.from("players").delete().eq("id", playerId);

  if (error) {
    const message = error.code === "23503"
      ? "No se puede eliminar: este jugador ya tiene partidas registradas."
      : "No se pudo eliminar el jugador. ¿Tenés permisos de administrador?";
    return { error: message };
  }

  revalidatePath(`/league/${slug}/players`);
  redirect(`/league/${slug}/players`);
}

export interface SetMemberRoleState {
  error: string | null;
}

export async function setMemberRole(
  leagueId: string,
  userId: string,
  role: LeagueRole,
  slug: string,
  playerId: string,
  _prevState: SetMemberRoleState,
  _formData: FormData
): Promise<SetMemberRoleState> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_member_role", {
    p_league_id: leagueId,
    p_user_id: userId,
    p_role: role,
  });

  if (error) {
    return { error: "No se pudo cambiar el rol. ¿Tenés permisos de administrador?" };
  }

  revalidatePath(`/league/${slug}/players/${playerId}`);
  revalidatePath(`/league/${slug}/players`);
  return { error: null };
}

export interface LinkPlayerAccountState {
  error: string | null;
}

export async function linkPlayerAccount(
  playerId: string,
  userId: string,
  leagueId: string,
  slug: string,
  _prevState: LinkPlayerAccountState,
  _formData: FormData
): Promise<LinkPlayerAccountState> {
  const supabase = await createClient();

  // Unirse a la liga crea un player propio automáticamente (ver
  // join_league). Si esa cuenta ya tiene uno en esta liga y todavía no
  // jugó ninguna partida, se borra para no dejar dos identidades
  // separadas para la misma persona al vincularla al jugador invitado.
  const { data: existing } = await supabase
    .from("players")
    .select("id")
    .eq("league_id", leagueId)
    .eq("user_id", userId)
    .neq("id", playerId)
    .maybeSingle();

  if (existing) {
    const { error: deleteError } = await supabase.from("players").delete().eq("id", existing.id);
    if (deleteError) {
      return {
        error: "Esa cuenta ya tiene un jugador propio con partidas registradas. Resolvé eso primero.",
      };
    }
  }

  const { error } = await supabase.from("players").update({ user_id: userId }).eq("id", playerId);
  if (error) {
    return { error: "No se pudo vincular. ¿Tenés permisos de administrador?" };
  }

  revalidatePath(`/league/${slug}/players/${playerId}`);
  revalidatePath(`/league/${slug}/players`);
  return { error: null };
}

export interface RenamePlayerState {
  error: string | null;
}

export async function renamePlayer(
  playerId: string,
  leagueId: string,
  slug: string,
  isOwnPlayer: boolean,
  _prevState: RenamePlayerState,
  formData: FormData
): Promise<RenamePlayerState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!displayName) {
    return { error: "Ingresá un nombre." };
  }

  const supabase = await createClient();

  const { error } = isOwnPlayer
    ? await supabase.rpc("set_own_display_name", {
        p_league_id: leagueId,
        p_display_name: displayName,
      })
    : await supabase.from("players").update({ display_name: displayName }).eq("id", playerId);

  if (error) {
    return { error: "No se pudo cambiar el nombre." };
  }

  revalidatePath(`/league/${slug}/players/${playerId}`);
  revalidatePath(`/league/${slug}/players`);
  revalidatePath(`/league/${slug}`);
  return { error: null };
}

export interface CreateGameResultInput {
  playerId: string;
  position: number;
  catanPoints?: number;
}

export interface CreateGameActionResult {
  gameId: string | null;
  error: string | null;
}

export async function createGameAction(
  leagueId: string,
  slug: string,
  results: CreateGameResultInput[],
  playedAt?: string
): Promise<CreateGameActionResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("create_game", {
    p_league_id: leagueId,
    p_notes: null,
    p_results: results.map((r) => ({
      player_id: r.playerId,
      position: r.position,
      catan_points: r.catanPoints ?? null,
    })),
    p_played_at: playedAt ? `${playedAt}T12:00:00` : null,
  });

  if (error) {
    return { gameId: null, error: error.message };
  }

  revalidatePath(`/league/${slug}`);
  return { gameId: data, error: null };
}

export interface UpdateGameDateState {
  error: string | null;
}

export async function updateGameDate(
  gameId: string,
  slug: string,
  _prevState: UpdateGameDateState,
  formData: FormData
): Promise<UpdateGameDateState> {
  const date = String(formData.get("playedAt") ?? "").trim();
  if (!date) {
    return { error: "Elegí una fecha." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("games")
    .update({ played_at: `${date}T12:00:00` })
    .eq("id", gameId);

  if (error) {
    return { error: "No se pudo cambiar la fecha. ¿Tenés permisos de administrador?" };
  }

  revalidatePath(`/league/${slug}/games/${gameId}`);
  revalidatePath(`/league/${slug}/games`);
  revalidatePath(`/league/${slug}`);
  return { error: null };
}

export async function updateGameAction(
  gameId: string,
  slug: string,
  results: CreateGameResultInput[],
  playedAt?: string
): Promise<CreateGameActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("update_game", {
    p_game_id: gameId,
    p_results: results.map((r) => ({
      player_id: r.playerId,
      position: r.position,
      catan_points: r.catanPoints ?? null,
    })),
    p_played_at: playedAt ? `${playedAt}T12:00:00` : null,
  });

  if (error) {
    return { gameId: null, error: error.message };
  }

  revalidatePath(`/league/${slug}/games/${gameId}`);
  revalidatePath(`/league/${slug}/games`);
  revalidatePath(`/league/${slug}`);
  return { gameId, error: null };
}

export interface DeleteGameState {
  error: string | null;
}

export async function deleteGame(
  gameId: string,
  slug: string,
  _prevState: DeleteGameState,
  _formData: FormData
): Promise<DeleteGameState> {
  const supabase = await createClient();
  const { error } = await supabase.from("games").delete().eq("id", gameId);

  if (error) {
    return { error: "No se pudo eliminar la partida. ¿Tenés permisos de administrador?" };
  }

  revalidatePath(`/league/${slug}/games`);
  revalidatePath(`/league/${slug}`);
  redirect(`/league/${slug}/games`);
}
