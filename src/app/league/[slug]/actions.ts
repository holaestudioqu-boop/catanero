"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
