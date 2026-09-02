import { notFound } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { GameDetail } from "@/components/league/GameDetail";
import { getGame, getLeagueBySlug, getPlayers } from "@/lib/data/leagues";

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ slug: string; gameId: string }>;
}) {
  const { slug, gameId } = await params;
  const league = await getLeagueBySlug(slug);
  if (!league) notFound();

  const [game, players] = await Promise.all([getGame(gameId), getPlayers(league.id)]);

  if (!game) {
    return (
      <EmptyState
        title="No encontramos esta partida."
        description="Puede que haya sido eliminada."
      />
    );
  }

  return <GameDetail slug={slug} game={game} players={players} />;
}
