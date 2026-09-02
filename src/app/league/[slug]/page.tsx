import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/LinkButton";
import { GameSummaryCard } from "@/components/league/GameSummaryCard";
import { RankingTable } from "@/components/league/RankingTable";
import { buildPlayerStats } from "@/lib/domain/ranking";
import { formatPointsPlain } from "@/lib/format";
import {
  getGames,
  getLeagueBySlug,
  getMembership,
  getPlayerForUser,
  getPlayers,
} from "@/lib/data/leagues";
import { createClient } from "@/lib/supabase/server";

export default async function LeagueHomePage({
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

  const [role, players, games, viewerPlayer] = await Promise.all([
    getMembership(league.id, user.id),
    getPlayers(league.id),
    getGames(league.id),
    getPlayerForUser(league.id, user.id),
  ]);

  const stats = buildPlayerStats(players, games);
  const me = viewerPlayer ? stats.find((s) => s.playerId === viewerPlayer.id) : undefined;
  const myPosition = me ? stats.findIndex((s) => s.playerId === me.playerId) + 1 : null;
  const lastGame = games[0];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Tu liga de Catan</p>
        <h1 className="text-2xl font-semibold">{league.name}</h1>
      </header>

      {me && myPosition ? (
        <div className="flex items-center justify-between rounded-2xl bg-primary p-4 text-primary-foreground shadow-sm">
          <div>
            <p className="text-xs opacity-80">Tu posición</p>
            <p className="text-xl font-semibold">#{myPosition}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-80">Tus puntos</p>
            <p className="text-xl font-semibold">{formatPointsPlain(me.rankingPoints)}</p>
          </div>
        </div>
      ) : null}

      {role === "admin" ? (
        <LinkButton href={`/league/${slug}/new-game`} fullWidth>
          Registrar partida
        </LinkButton>
      ) : null}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ranking</h2>
          <Link href={`/league/${slug}/stats`} className="text-sm font-medium text-primary">
            Ver stats
          </Link>
        </div>
        {stats.some((s) => s.gamesPlayed > 0) ? (
          <RankingTable slug={slug} stats={stats} highlightPlayerId={viewerPlayer?.id} />
        ) : (
          <EmptyState
            title="Todavía no jugaron ninguna partida."
            description={
              role === "admin"
                ? "Registrá la primera para empezar a construir el ranking."
                : "Cuando un admin registre una partida, va a aparecer acá."
            }
          />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Última partida</h2>
        {lastGame ? (
          <GameSummaryCard slug={slug} game={lastGame} players={players} />
        ) : (
          <EmptyState title="Todavía no hay partidas registradas." />
        )}
      </section>
    </div>
  );
}
