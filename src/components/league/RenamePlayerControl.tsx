"use client";

import { useActionState, useState } from "react";
import { renamePlayer, type RenamePlayerState } from "@/app/league/[slug]/actions";
import { Button } from "@/components/ui/Button";

const INITIAL_STATE: RenamePlayerState = { error: null };

interface RenamePlayerControlProps {
  playerId: string;
  leagueId: string;
  slug: string;
  isOwnPlayer: boolean;
  currentName: string;
}

export function RenamePlayerControl({
  playerId,
  leagueId,
  slug,
  isOwnPlayer,
  currentName,
}: RenamePlayerControlProps) {
  const [editing, setEditing] = useState(false);
  const boundRename = renamePlayer.bind(null, playerId, leagueId, slug, isOwnPlayer);
  const [state, formAction, pending] = useActionState(boundRename, INITIAL_STATE);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="self-start text-xs font-medium text-primary hover:underline"
      >
        {isOwnPlayer ? "Cambiar mi nombre" : "Editar nombre"}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <form action={formAction} className="flex items-center gap-2">
        <input
          name="displayName"
          autoFocus
          required
          defaultValue={currentName}
          className="h-10 flex-1 rounded-[var(--radius-control)] border border-border bg-background px-3 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar"}
        </Button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-xs text-muted hover:underline"
        >
          Cancelar
        </button>
      </form>
      {state.error ? <p className="text-xs text-danger">{state.error}</p> : null}
    </div>
  );
}
