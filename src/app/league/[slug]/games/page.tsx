import { notFound } from "next/navigation";
import { GamesList } from "@/components/league/GamesList";
import { getGames, getLeagueBySlug, getMembership, getPlayers } from "@/lib/data/leagues";
import { createClient } from "@/lib/supabase/server";

export default async function GamesPage({
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

  return (
    <GamesList slug={slug} players={players} games={games} canRegister={role === "admin"} />
  );
}
