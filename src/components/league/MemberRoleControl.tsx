"use client";

import { useActionState, useState } from "react";
import { setMemberRole, type SetMemberRoleState } from "@/app/league/[slug]/actions";
import type { LeagueRole } from "@/lib/supabase/types";

const INITIAL_STATE: SetMemberRoleState = { error: null };

interface MemberRoleControlProps {
  leagueId: string;
  userId: string;
  slug: string;
  playerId: string;
  currentRole: LeagueRole;
}

export function MemberRoleControl({
  leagueId,
  userId,
  slug,
  playerId,
  currentRole,
}: MemberRoleControlProps) {
  const nextRole: LeagueRole = currentRole === "admin" ? "player" : "admin";
  const [confirming, setConfirming] = useState(false);
  const boundSetRole = setMemberRole.bind(null, leagueId, userId, nextRole, slug, playerId);
  const [state, formAction, pending] = useActionState(boundSetRole, INITIAL_STATE);

  const label = currentRole === "admin" ? "Quitar admin" : "Hacer admin";
  const confirmLabel = currentRole === "admin" ? "Quitar permisos de admin" : "Confirmar como admin";

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted">
        Rol en la liga: <span className="font-medium text-foreground">{currentRole === "admin" ? "Admin" : "Jugador"}</span>
      </p>

      {confirming ? (
        <div className="flex items-center gap-3">
          <form action={formAction}>
            <button
              type="submit"
              disabled={pending}
              className="text-xs font-medium text-primary hover:underline"
            >
              {pending ? "Guardando…" : confirmLabel}
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
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="self-start text-xs font-medium text-primary hover:underline"
        >
          {label}
        </button>
      )}

      {state.error ? <p className="text-xs text-danger">{state.error}</p> : null}
    </div>
  );
}
