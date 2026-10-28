import { notFound } from "next/navigation";
import { GamesList } from "@/components/league/GamesList";
import { getGames, getLeagueBySlug, getPlayers } from "@/lib/data/leagues";

export default async function GamesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const league = await getLeagueBySlug(slug);
  if (!league) notFound();

  const [players, games] = await Promise.all([getPlayers(league.id), getGames(league.id)]);

  return <GamesList slug={slug} players={players} games={games} />;
}
