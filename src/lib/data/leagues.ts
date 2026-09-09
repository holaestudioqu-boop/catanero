import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Game, Player } from "@/lib/domain/types";
import type { LeagueRole } from "@/lib/supabase/types";

export interface League {
  id: string;
  name: string;
  slug: string;
}

export interface LeagueSummary extends League {
  role: LeagueRole;
  playerCount: number;
}

export const getOwnDisplayName = cache(async (userId: string): Promise<string | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .maybeSingle();
  return data?.display_name ?? null;
});

export const getUserLeagues = cache(async (userId: string): Promise<LeagueSummary[]> => {
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("league_members")
    .select("league_id, role")
    .eq("user_id", userId);

  if (!memberships || memberships.length === 0) return [];

  const leagueIds = memberships.map((m) => m.league_id);

  const [{ data: leagues }, { data: players }] = await Promise.all([
    supabase.from("leagues").select("id, name, slug").in("id", leagueIds),
    supabase.from("players").select("league_id").in("league_id", leagueIds),
  ]);

  const roleByLeagueId = new Map(memberships.map((m) => [m.league_id, m.role as LeagueRole]));
  const playerCountByLeagueId = new Map<string, number>();
  for (const player of players ?? []) {
    playerCountByLeagueId.set(
      player.league_id,
      (playerCountByLeagueId.get(player.league_id) ?? 0) + 1
    );
  }

  return (leagues ?? []).map((league) => ({
    id: league.id,
    name: league.name,
    slug: league.slug,
    role: roleByLeagueId.get(league.id) ?? "player",
    playerCount: playerCountByLeagueId.get(league.id) ?? 0,
  }));
});

export const getLeagueBySlug = cache(async (slug: string): Promise<League | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leagues")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();
  return data;
});

export const getMembership = cache(
  async (leagueId: string, userId: string): Promise<LeagueRole | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("league_members")
      .select("role")
      .eq("league_id", leagueId)
      .eq("user_id", userId)
      .maybeSingle();
    return (data?.role as LeagueRole | undefined) ?? null;
  }
);

export const getPlayerForUser = cache(
  async (leagueId: string, userId: string): Promise<Player | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("players")
      .select("id, display_name")
      .eq("league_id", leagueId)
      .eq("user_id", userId)
      .maybeSingle();
    return data ? { id: data.id, displayName: data.display_name } : null;
  }
);

export interface PlayerAccountInfo {
  userId: string | null;
  role: LeagueRole | null;
}

export const getPlayerAccountInfo = cache(
  async (leagueId: string, playerId: string): Promise<PlayerAccountInfo> => {
    const supabase = await createClient();
    const { data: player } = await supabase
      .from("players")
      .select("user_id")
      .eq("id", playerId)
      .maybeSingle();

    if (!player?.user_id) return { userId: null, role: null };

    const { data: membership } = await supabase
      .from("league_members")
      .select("role")
      .eq("league_id", leagueId)
      .eq("user_id", player.user_id)
      .maybeSingle();

    return { userId: player.user_id, role: (membership?.role as LeagueRole | undefined) ?? null };
  }
);

export const getPlayers = cache(async (leagueId: string): Promise<Player[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("players")
    .select("id, display_name")
    .eq("league_id", leagueId)
    .order("display_name");

  return (data ?? []).map((p) => ({ id: p.id, displayName: p.display_name }));
});

export const getGames = cache(async (leagueId: string): Promise<Game[]> => {
  const supabase = await createClient();

  const { data: games } = await supabase
    .from("games")
    .select("id, played_at, notes")
    .eq("league_id", leagueId)
    .order("played_at", { ascending: false });

  if (!games || games.length === 0) return [];

  const { data: results } = await supabase
    .from("game_results")
    .select("game_id, player_id, position, catan_points")
    .in(
      "game_id",
      games.map((g) => g.id)
    );

  const resultsByGameId = new Map<string, Game["results"]>();
  for (const r of results ?? []) {
    const list = resultsByGameId.get(r.game_id) ?? [];
    list.push({
      playerId: r.player_id,
      position: r.position,
      catanPoints: r.catan_points ?? undefined,
    });
    resultsByGameId.set(r.game_id, list);
  }

  return games.map((g) => ({
    id: g.id,
    playedAt: g.played_at,
    notes: g.notes ?? undefined,
    results: (resultsByGameId.get(g.id) ?? []).sort((a, b) => a.position - b.position),
  }));
});

export const getGame = cache(async (gameId: string): Promise<Game | null> => {
  const supabase = await createClient();
  const { data: game } = await supabase
    .from("games")
    .select("id, played_at, notes")
    .eq("id", gameId)
    .maybeSingle();

  if (!game) return null;

  const { data: results } = await supabase
    .from("game_results")
    .select("player_id, position, catan_points")
    .eq("game_id", gameId);

  return {
    id: game.id,
    playedAt: game.played_at,
    notes: game.notes ?? undefined,
    results: (results ?? [])
      .map((r) => ({
        playerId: r.player_id,
        position: r.position,
        catanPoints: r.catan_points ?? undefined,
      }))
      .sort((a, b) => a.position - b.position),
  };
});
