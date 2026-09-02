import { notFound } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlayerProfile } from "@/components/league/PlayerProfile";
import { buildPlayerStats } from "@/lib/domain/ranking";
import { getGames, getLeagueBySlug, getPlayers } from "@/lib/data/leagues";

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ slug: string; playerId: string }>;
}) {
  const { slug, playerId } = await params;
  const league = await getLeagueBySlug(slug);
  if (!league) notFound();

  const [players, games] = await Promise.all([getPlayers(league.id), getGames(league.id)]);

  const player = players.find((p) => p.id === playerId);
  if (!player) {
    return <EmptyState title="No encontramos a este jugador." />;
  }

  const stats = buildPlayerStats(players, games).find((s) => s.playerId === playerId)!;
  const recentGames = games
    .filter((g) => g.results.some((r) => r.playerId === playerId))
    .slice(0, 5);

  return <PlayerProfile slug={slug} player={player} stats={stats} recentGames={recentGames} />;
}
