import { notFound } from "next/navigation";
import { PlayersList } from "@/components/league/PlayersList";
import { buildPlayerStats } from "@/lib/domain/ranking";
import { getGames, getLeagueBySlug, getMembership, getPlayers } from "@/lib/data/leagues";
import { createClient } from "@/lib/supabase/server";

export default async function PlayersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const league = await getLeagueBySlug(slug);
  if (!league) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [role, players, games] = await Promise.all([
    getMembership(league.id, user.id),
    getPlayers(league.id),
    getGames(league.id),
  ]);

  const stats = buildPlayerStats(players, games);

  return (
    <PlayersList
      slug={slug}
      leagueId={league.id}
      players={players}
      stats={stats}
      canAdd={role === "admin"}
    />
  );
}
