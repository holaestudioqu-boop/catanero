"use client";

import { useState, useTransition } from "react";
import { deleteComment, deletePost } from "@/app/league/[slug]/community-actions";

interface DeleteCommunityItemButtonProps {
  kind: "post" | "comment";
  id: string;
  slug: string;
}

export function DeleteCommunityItemButton({ kind, id, slug }: DeleteCommunityItemButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      const result = kind === "post" ? await deletePost(id, slug) : await deleteComment(id, slug);
      if (result.error) {
        setError(result.error);
        setConfirming(false);
      }
    });
  }

  if (!confirming) {
    return (
      <span className="inline-flex items-center gap-2">
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-xs text-danger hover:underline"
        >
          Borrar
        </button>
        {error ? <span className="text-xs text-danger">{error}</span> : null}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-xs">
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="font-medium text-danger hover:underline"
      >
        {pending ? "Borrando…" : "Confirmar"}
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="text-muted hover:underline">
        Cancelar
      </button>
    </span>
  );
}
