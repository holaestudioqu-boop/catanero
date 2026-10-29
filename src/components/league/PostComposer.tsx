"use client";

import { useState, useTransition, type FormEvent } from "react";
import { createPost } from "@/app/league/[slug]/community-actions";
import { Button } from "@/components/ui/Button";
import { MAX_MESSAGE_LENGTH } from "@/lib/domain/community";

interface PostComposerProps {
  leagueId: string;
  slug: string;
}

export function PostComposer({ leagueId, slug }: PostComposerProps) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await createPost(leagueId, slug, body);
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
      <textarea
        value={body}
        onChange={(event) => {
          setBody(event.target.value);
          setError(null);
        }}
        rows={3}
        maxLength={MAX_MESSAGE_LENGTH}
        placeholder="Escribí algo para la liga…"
        className="w-full resize-none rounded-[var(--radius-control)] border border-border bg-surface p-3 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted tabular-nums">
          {body.length}/{MAX_MESSAGE_LENGTH}
        </span>
        <Button type="submit" disabled={pending || body.trim().length === 0}>
          {pending ? "Publicando…" : "Publicar"}
        </Button>
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </form>
  );
}
