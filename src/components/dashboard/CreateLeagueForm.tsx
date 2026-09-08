"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { createLeague, type CreateLeagueState } from "@/app/dashboard/actions";

const INITIAL_STATE: CreateLeagueState = { error: null };

export function CreateLeagueForm() {
  const [state, formAction, pending] = useActionState(createLeague, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:items-end">
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <label htmlFor="league-name" className="sr-only">
          Nombre de la liga nueva
        </label>
        <input
          id="league-name"
          name="name"
          required
          placeholder="Nombre de la liga…"
          className="h-11 w-full min-w-0 rounded-[var(--radius-control)] border border-white/10 bg-carbon-sec px-3 text-[15px] text-crema placeholder:text-crema/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-56"
        />
        <Button type="submit" disabled={pending} fullWidth className="sm:w-auto">
          {pending ? "Creando…" : "Crear nueva liga"}
        </Button>
      </div>
      {state.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
    </form>
  );
}
