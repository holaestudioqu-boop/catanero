"use client";

import { useActionState, useState } from "react";
import { deleteGame, type DeleteGameState } from "@/app/league/[slug]/actions";

const INITIAL_STATE: DeleteGameState = { error: null };

export function DeleteGameButton({ gameId, slug }: { gameId: string; slug: string }) {
  const [confirming, setConfirming] = useState(false);
  const boundDelete = deleteGame.bind(null, gameId, slug);
  const [state, formAction, pending] = useActionState(boundDelete, INITIAL_STATE);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs font-medium text-danger hover:underline"
      >
        Eliminar partida
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
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
          className="text-xs text-muted hover:underline"
        >
          Cancelar
        </button>
      </div>
      {state.error ? <p className="text-xs text-danger">{state.error}</p> : null}
    </div>
  );
}
