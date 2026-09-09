"use client";

import { useActionState, useState } from "react";
import { linkPlayerAccount, type LinkPlayerAccountState } from "@/app/league/[slug]/actions";
import { Button } from "@/components/ui/Button";
import type { UnlinkedMember } from "@/lib/data/leagues";

const INITIAL_STATE: LinkPlayerAccountState = { error: null };

interface LinkPlayerAccountControlProps {
  playerId: string;
  leagueId: string;
  slug: string;
  members: UnlinkedMember[];
}

export function LinkPlayerAccountControl({
  playerId,
  leagueId,
  slug,
  members,
}: LinkPlayerAccountControlProps) {
  const [selected, setSelected] = useState(members[0]?.userId ?? "");
  const boundLink = linkPlayerAccount.bind(null, playerId, selected, leagueId, slug);
  const [state, formAction, pending] = useActionState(boundLink, INITIAL_STATE);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted">
        Este jugador no tiene cuenta. Si ya se registró, vinculalo para que vea su propio
        historial.
      </p>
      <form action={formAction} className="flex items-center gap-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="h-10 flex-1 rounded-[var(--radius-control)] border border-border bg-background px-3 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.displayName}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Vinculando…" : "Vincular"}
        </Button>
      </form>
      {state.error ? <p className="text-xs text-danger">{state.error}</p> : null}
    </div>
  );
}
