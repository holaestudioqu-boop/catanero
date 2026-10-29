import { notFound } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { GameDetail } from "@/components/league/GameDetail";
import { getGameComments, getGameReactions } from "@/lib/data/community";
import { getGame, getLeagueBySlug, getMembership, getPlayers } from "@/lib/data/leagues";
import { createClient } from "@/lib/supabase/server";

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ slug: string; gameId: string }>;
}) {
  const { slug, gameId } = await params;
  const league = await getLeagueBySlug(slug);
  if (!league) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [game, players, role, reactions, comments] = await Promise.all([
    getGame(gameId),
    getPlayers(league.id),
    getMembership(league.id, user.id),
    getGameReactions(gameId, user.id),
    getGameComments(league.id, gameId, user.id),
  ]);

  if (!game) {
    return (
      <EmptyState
        title="No encontramos esta partida."
        description="Puede que haya sido eliminada."
      />
    );
  }

  return (
    <GameDetail
      slug={slug}
      leagueId={league.id}
      game={game}
      players={players}
      canManage={role === "admin"}
      viewerId={user.id}
      reactions={reactions}
      comments={comments}
    />
  );
}
