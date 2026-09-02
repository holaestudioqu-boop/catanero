import { notFound, redirect } from "next/navigation";
import { NewGameWizard } from "@/components/league/NewGameWizard";
import { getLeagueBySlug, getMembership, getPlayers } from "@/lib/data/leagues";
import { createClient } from "@/lib/supabase/server";

export default async function NewGamePage({
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

  const role = await getMembership(league.id, user.id);
  if (role !== "admin") {
    redirect(`/league/${slug}`);
  }

  const players = await getPlayers(league.id);

  return <NewGameWizard leagueId={league.id} slug={slug} players={players} />;
}
