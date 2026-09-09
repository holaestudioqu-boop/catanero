import { notFound } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { GameDetail } from "@/components/league/GameDetail";
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

  const [game, players, role] = await Promise.all([
    getGame(gameId),
    getPlayers(league.id),
    getMembership(league.id, user.id),
  ]);

  if (!game) {
    return (
      <EmptyState
        title="No encontramos esta partida."
        description="Puede que haya sido eliminada."
      />
    );
  }

  return <GameDetail slug={slug} game={game} players={players} canEditDate={role === "admin"} />;
}
