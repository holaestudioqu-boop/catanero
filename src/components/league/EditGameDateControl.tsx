"use client";

import { useActionState, useState } from "react";
import { updateGameDate, type UpdateGameDateState } from "@/app/league/[slug]/actions";
import { Button } from "@/components/ui/Button";

const INITIAL_STATE: UpdateGameDateState = { error: null };

interface EditGameDateControlProps {
  gameId: string;
  slug: string;
  currentDate: string;
}

export function EditGameDateControl({ gameId, slug, currentDate }: EditGameDateControlProps) {
  const [editing, setEditing] = useState(false);
  const boundUpdate = updateGameDate.bind(null, gameId, slug);
  const [state, formAction, pending] = useActionState(boundUpdate, INITIAL_STATE);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="self-start text-xs font-medium text-primary hover:underline"
      >
        Editar fecha
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <form action={formAction} className="flex items-center gap-2">
        <input
          name="playedAt"
          type="date"
          autoFocus
          required
          defaultValue={currentDate}
          max={new Date().toLocaleDateString("en-CA")}
          className="h-10 rounded-[var(--radius-control)] border border-border bg-background px-3 text-[15px] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
