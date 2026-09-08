import { notFound } from "next/navigation";
import { StatsView } from "@/components/league/StatsView";
import { buildPlayerStats } from "@/lib/domain/ranking";
import { getGames, getLeagueBySlug, getPlayers } from "@/lib/data/leagues";

export default async function StatsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const league = await getLeagueBySlug(slug);
  if (!league) notFound();

  const [players, games] = await Promise.all([getPlayers(league.id), getGames(league.id)]);
  const stats = buildPlayerStats(players, games);

  return <StatsView slug={slug} stats={stats} gamesPlayed={games.length} />;
}
