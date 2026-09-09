import { notFound } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlayerProfile } from "@/components/league/PlayerProfile";
import { buildPlayerStats } from "@/lib/domain/ranking";
import { calculateRankingPoints } from "@/lib/domain/scoring";
import {
  getGames,
  getLeagueBySlug,
  getMembership,
  getPlayerAccountInfo,
  getPlayers,
  getUnlinkedMembers,
} from "@/lib/data/leagues";
import { createClient } from "@/lib/supabase/server";

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ slug: string; playerId: string }>;
}) {
  const { slug, playerId } = await params;
  const league = await getLeagueBySlug(slug);
  if (!league) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [role, players, games, account, unlinkedMembers] = await Promise.all([
    getMembership(league.id, user.id),
    getPlayers(league.id),
    getGames(league.id),
    getPlayerAccountInfo(league.id, playerId),
    getUnlinkedMembers(league.id),
  ]);

  const player = players.find((p) => p.id === playerId);
  if (!player) {
    return <EmptyState title="No encontramos a este jugador." />;
  }

  const allStats = buildPlayerStats(players, games);
  const stats = allStats.find((s) => s.playerId === playerId)!;
  const position = allStats.findIndex((s) => s.playerId === playerId) + 1;
  const playerGames = games.filter((g) => g.results.some((r) => r.playerId === playerId));
  const recentGames = playerGames.slice(0, 5);

  const chronological = [...playerGames].sort((a, b) => (a.playedAt < b.playedAt ? -1 : 1));
  let cumulative = 0;
  const pointsHistory = chronological.map((g) => {
    const result = g.results.find((r) => r.playerId === playerId)!;
    cumulative += calculateRankingPoints(result.position, g.results.length);
    return cumulative;
  });

  const roleControl =
    role === "admin" && account.role && account.userId && account.userId !== user.id
      ? { leagueId: league.id, userId: account.userId, currentRole: account.role }
      : null;

  const canLinkAccount = role === "admin" && !account.userId && unlinkedMembers.length > 0;
  const isOwnPlayer = account.userId === user.id;
  const renameControl =
    role === "admin" || isOwnPlayer
      ? { leagueId: league.id, isOwnPlayer }
      : null;

  return (
    <PlayerProfile
      slug={slug}
      player={player}
      stats={stats}
      position={position}
      recentGames={recentGames}
      pointsHistory={pointsHistory}
      canDelete={role === "admin"}
      roleControl={roleControl}
      linkAccount={canLinkAccount ? { leagueId: league.id, members: unlinkedMembers } : null}
      renameControl={renameControl}
    />
  );
}
