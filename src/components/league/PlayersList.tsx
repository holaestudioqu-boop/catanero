"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { addPlayer, type AddPlayerState } from "@/app/league/[slug]/actions";
import type { Player } from "@/lib/domain/types";

const INITIAL_STATE: AddPlayerState = { error: null };

interface PlayersListProps {
  slug: string;
  leagueId: string;
  players: Player[];
  canAdd: boolean;
}

export function PlayersList({ slug, leagueId, players, canAdd }: PlayersListProps) {
  const [adding, setAdding] = useState(false);
  const boundAddPlayer = addPlayer.bind(null, leagueId, slug);
  const [state, formAction, pending] = useActionState(boundAddPlayer, INITIAL_STATE);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Jugadores</h1>
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
              className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
        {players.map((player) => (
          <li key={player.id}>
            <Link
              href={`/league/${slug}/players/${player.id}`}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] font-medium transition-colors hover:bg-black/[.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:hover:bg-white/[.03]"
            >
              {player.displayName}
              <span className="text-muted">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
