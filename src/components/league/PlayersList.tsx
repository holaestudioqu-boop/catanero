"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PositionBadge } from "@/components/ui/PositionBadge";
import { addPlayer, type AddPlayerState } from "@/app/league/[slug]/actions";
import { formatPointsPlain } from "@/lib/format";
import type { Player, PlayerStats } from "@/lib/domain/types";

const INITIAL_STATE: AddPlayerState = { error: null };

interface PlayersListProps {
  slug: string;
  leagueId: string;
  players: Player[];
  stats: PlayerStats[];
  canAdd: boolean;
}

export function PlayersList({ slug, leagueId, stats, canAdd }: PlayersListProps) {
  const [adding, setAdding] = useState(false);
  const boundAddPlayer = addPlayer.bind(null, leagueId, slug);
  const [state, formAction, pending] = useActionState(boundAddPlayer, INITIAL_STATE);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-editorial text-3xl text-foreground">Jugadores</h1>
        {canAdd && !adding ? (
          <Button variant="secondary" onClick={() => setAdding(true)}>
            Agregar jugador
          </Button>
        ) : null}
      </div>

      {canAdd && adding ? (
        <Card>
          <form action={formAction} className="flex items-center gap-2">
            <label htmlFor="new-player-name" className="sr-only">
              Nombre del jugador
            </label>
            <input
              id="new-player-name"
              name="displayName"
              autoFocus
              required
              placeholder="Nombre del jugador"
              className="h-10 flex-1 rounded-[var(--radius-control)] border border-border bg-background px-3 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <Button type="submit" disabled={pending}>
              {pending ? "Agregando…" : "Agregar"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
              Listo
            </Button>
          </form>
          {state.error ? <p className="mt-2 text-sm text-danger">{state.error}</p> : null}
        </Card>
      ) : null}

      <ul className="flex flex-col gap-2">
        {stats.map((player, index) => {
          const position = index + 1;
          return (
            <li key={player.playerId}>
              <Link
                href={`/league/${slug}/players/${player.playerId}`}
                className="flex items-center gap-3 rounded-[var(--radius-sm)] bg-surface px-4 py-3 transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-foreground">
                  {player.displayName.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium text-foreground">
                    {player.displayName}
                  </p>
                  {player.gamesPlayed > 0 ? (
                    <p className="text-xs text-muted">
                      #{position} · {formatPointsPlain(player.rankingPoints)} pts
                    </p>
                  ) : (
                    <p className="text-xs text-muted">Sin partidas todavía</p>
                  )}
                </div>
                <PositionBadge position={position} />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
