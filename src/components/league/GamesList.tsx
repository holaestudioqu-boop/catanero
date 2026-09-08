import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/LinkButton";
import { GameHistoryRow } from "@/components/league/GameHistoryRow";
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
      <div>
        <p className="text-xs font-medium tracking-[0.08em] text-muted uppercase">Partidas</p>
        <h1 className="font-editorial mt-1 text-3xl text-foreground">
          Los capítulos de esta temporada.
        </h1>
      </div>

      {games.length === 0 ? (
        <EmptyState
          title="Todavía no empezó la historia."
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
        <div className="flex flex-col gap-2">
          {games.map((game) => (
            <GameHistoryRow key={game.id} slug={slug} game={game} players={players} />
          ))}
        </div>
      )}
    </div>
  );
}
