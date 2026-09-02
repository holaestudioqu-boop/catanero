import { notFound } from "next/navigation";
import { PlayersList } from "@/components/league/PlayersList";
import { getLeagueBySlug, getMembership, getPlayers } from "@/lib/data/leagues";
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

  const [role, players] = await Promise.all([
    getMembership(league.id, user.id),
    getPlayers(league.id),
  ]);

  return (
    <PlayersList
      slug={slug}
      leagueId={league.id}
      players={players}
      canAdd={role === "admin"}
    />
  );
}
