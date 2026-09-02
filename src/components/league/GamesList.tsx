import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/LinkButton";
import { GameSummaryCard } from "@/components/league/GameSummaryCard";
import type { Game, Player } from "@/lib/domain/types";

interface GamesListProps {
  slug: string;
  players: Player[];
  games: Game[];
  canRegister: boolean;
}

export function GamesList({ slug, players, games, canRegister }: GamesListProps) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Partidas</h1>
      {games.length === 0 ? (
        <EmptyState
          title="Todavía no jugaron ninguna partida."
          description={
            canRegister
              ? "Registrá la primera partida de la liga."
              : "Cuando un admin registre una partida, va a aparecer acá."
          }
          action={
            canRegister ? (
              <LinkButton href={`/league/${slug}/new-game`}>Registrar la primera</LinkButton>
            ) : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {games.map((game) => (
            <GameSummaryCard key={game.id} slug={slug} game={game} players={players} />
          ))}
        </div>
      )}
    </div>
  );
}
