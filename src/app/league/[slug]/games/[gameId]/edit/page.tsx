import { notFound, redirect } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { NewGameWizard } from "@/components/league/NewGameWizard";
import { getGame, getLeagueBySlug, getMembership, getPlayers } from "@/lib/data/leagues";
import { createClient } from "@/lib/supabase/server";

export default async function EditGamePage({
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

  const role = await getMembership(league.id, user.id);
  if (role !== "admin") {
    redirect(`/league/${slug}/games/${gameId}`);
  }

  const [game, players] = await Promise.all([getGame(gameId), getPlayers(league.id)]);

  if (!game) {
    return (
      <EmptyState
        title="No encontramos esta partida."
        description="Puede que haya sido eliminada."
      />
    );
  }

  return (
    <NewGameWizard leagueId={league.id} slug={slug} players={players} existingGame={game} />
  );
}
