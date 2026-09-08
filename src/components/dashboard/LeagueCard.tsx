"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { deleteLeague, type DeleteLeagueState } from "@/app/dashboard/actions";
import type { LeagueSummary } from "@/lib/data/leagues";

const INITIAL_STATE: DeleteLeagueState = { error: null };

export function LeagueCard({ league }: { league: LeagueSummary }) {
  const [confirming, setConfirming] = useState(false);
  const boundDelete = deleteLeague.bind(null, league.id);
  const [state, formAction, pending] = useActionState(boundDelete, INITIAL_STATE);

  return (
    <div className="group relative rounded-[var(--radius-sm)] bg-carbon-sec p-5 transition-colors hover:bg-white/5">
      <Link href={`/league/${league.slug}`} className="block">
        <p className="truncate pr-6 text-[15px] font-medium text-crema">{league.name}</p>
        <p className="mt-3 text-sm text-crema/50">
          {league.playerCount} {league.playerCount === 1 ? "jugador" : "jugadores"} ·{" "}
          {league.role === "admin" ? "Admin" : "Jugador"}
        </p>
      </Link>

      {league.role === "admin" ? (
        confirming ? (
          <div className="mt-3 flex items-center gap-3">
            <form action={formAction}>
              <button
                type="submit"
                disabled={pending}
                className="text-xs font-medium text-danger hover:underline"
              >
                {pending ? "Eliminando…" : "Confirmar borrado"}
              </button>
            </form>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="text-xs text-crema/50 hover:underline"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="absolute top-4 right-4 text-xs text-crema/30 opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
          >
            Eliminar
          </button>
        )
      ) : null}

      {state.error ? <p className="mt-2 text-xs text-danger">{state.error}</p> : null}
    </div>
  );
}
