"use client";

import { useState, useTransition, type FormEvent } from "react";
import { addComment } from "@/app/league/[slug]/community-actions";
import { Button } from "@/components/ui/Button";
import { MAX_MESSAGE_LENGTH } from "@/lib/domain/community";

interface CommentFormProps {
  leagueId: string;
  gameId: string;
  slug: string;
}

export function CommentForm({ leagueId, gameId, slug }: CommentFormProps) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await addComment(leagueId, gameId, slug, body);
      if (result.error) {
        setError(result.error);
        return;
      }
      setBody("");
      setError(null);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          value={body}
          onChange={(event) => {
            setBody(event.target.value);
            setError(null);
          }}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder="Dejá un comentario…"
          className="h-12 min-w-0 flex-1 rounded-[var(--radius-control)] border border-border bg-background px-3 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        <Button type="submit" disabled={pending || body.trim().length === 0}>
          {pending ? "Enviando…" : "Enviar"}
        </Button>
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </form>
  );
}
