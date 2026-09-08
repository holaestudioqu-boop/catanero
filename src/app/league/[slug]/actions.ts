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
  results: CreateGameResultInput[]
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
  });

  if (error) {
    return { gameId: null, error: error.message };
  }

  revalidatePath(`/league/${slug}`);
  return { gameId: data, error: null };
}
