"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { createLeague, type CreateLeagueState } from "@/app/dashboard/actions";

const INITIAL_STATE: CreateLeagueState = { error: null };

export function CreateLeagueForm() {
  const [state, formAction, pending] = useActionState(createLeague, INITIAL_STATE);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4"
    >
      <label htmlFor="league-name" className="text-sm font-medium">
        Crear una liga nueva
      </label>
      <div className="flex gap-2">
        <input
          id="league-name"
          name="name"
          required
          placeholder="Ej: Catan Bahía"
          className="h-11 flex-1 rounded-xl border border-border bg-background px-3 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Creando…" : "Crear"}
        </Button>
      </div>
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
    </form>
  );
}
