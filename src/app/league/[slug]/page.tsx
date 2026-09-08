import Image from "next/image";
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
      <div className="relative overflow-hidden rounded-[var(--radius-lg)]">
        <div className="relative aspect-[4/5] w-full sm:aspect-[16/9]">
          <Image
            src="/brand/hero-landing.jpg"
            alt=""
            fill
            className="object-cover object-[55%_60%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/40 to-carbon/10" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7">
          <p className="text-xs font-medium tracking-[0.08em] text-crema/60 uppercase">
            Tu liga de Catan
          </p>
          <h1 className="font-editorial mt-1 text-4xl leading-[1.05] text-crema sm:text-5xl">
            {league.name}
          </h1>

          {me && myPosition ? (
            <p className="mt-3 text-sm text-crema/80">
              Tu posición{" "}
              <span className={myPosition === 1 ? "font-semibold text-dorado" : "font-semibold text-crema"}>
                #{myPosition}
              </span>{" "}
              · {formatPointsPlain(me.rankingPoints)} pts
            </p>
          ) : null}

          {role === "admin" ? (
            <LinkButton href={`/league/${slug}/new-game`} className="mt-5 self-start">
              + Registrar partida
            </LinkButton>
          ) : null}
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-editorial text-2xl text-foreground">Ranking</h2>
          <Link href={`/league/${slug}/stats`} className="text-sm font-medium text-primary">
            Ver stats
          </Link>
        </div>
        {stats.some((s) => s.gamesPlayed > 0) ? (
          <RankingTable slug={slug} stats={stats} highlightPlayerId={viewerPlayer?.id} />
        ) : (
          <EmptyState
            title="Todavía no empezó la historia."
            description={
              role === "admin"
                ? "Registrá la primera partida para empezar a construir el ranking."
                : "Cuando un admin registre una partida, va a aparecer acá."
            }
          />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-editorial text-2xl text-foreground">Última partida</h2>
        {lastGame ? (
          <GameSummaryCard slug={slug} game={lastGame} players={players} />
        ) : (
          <EmptyState title="Todavía no hay partidas registradas." />
        )}
      </section>
    </div>
  );
}
