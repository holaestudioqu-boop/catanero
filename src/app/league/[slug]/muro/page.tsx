import { notFound, redirect } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { PostComposer } from "@/components/league/PostComposer";
import { WallFeed, type WallItem } from "@/components/league/WallFeed";
import { getRecentGameCreations, getWallPosts } from "@/lib/data/community";
import { getGames, getLeagueBySlug, getMembership, getPlayers } from "@/lib/data/leagues";
import { createClient } from "@/lib/supabase/server";

const WALL_ITEM_LIMIT = 50;

export default async function WallPage({
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
  if (!role) {
    redirect(`/league/${slug}`);
  }

  const [players, games, posts, creations] = await Promise.all([
    getPlayers(league.id),
    getGames(league.id),
    getWallPosts(league.id, user.id),
    getRecentGameCreations(league.id),
  ]);

  const playerNameById = new Map(players.map((p) => [p.id, p.displayName]));
  const gameById = new Map(games.map((g) => [g.id, g]));

  const gameItems = creations.flatMap((creation): WallItem[] => {
    const game = gameById.get(creation.gameId);
    if (!game) return [];
    const winner = game.results.find((r) => r.position === 1);
    return [
      {
        type: "game",
        at: creation.createdAt,
        gameId: game.id,
        winnerName: winner ? (playerNameById.get(winner.playerId) ?? null) : null,
        playerCount: game.results.length,
      },
    ];
  });

  const postItems = posts.map((post): WallItem => ({ type: "post", at: post.createdAt, post }));

  const items = [...postItems, ...gameItems]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, WALL_ITEM_LIMIT);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-medium tracking-[0.08em] text-muted uppercase">Muro</p>
        <h1 className="font-editorial mt-1 text-3xl text-foreground">
          Lo que se dice en la liga.
        </h1>
      </div>

      <PostComposer leagueId={league.id} slug={slug} />

      {items.length === 0 ? (
        <EmptyState
          title="El muro está vacío."
          description="Escribí el primer mensaje para arrancar la charla."
        />
      ) : (
        <WallFeed
          leagueId={league.id}
          slug={slug}
          items={items}
          viewerId={user.id}
          isAdmin={role === "admin"}
        />
      )}
    </div>
  );
}
