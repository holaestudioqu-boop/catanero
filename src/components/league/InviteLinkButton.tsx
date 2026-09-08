"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function InviteLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const url = `${window.location.origin}/join/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copiá este link para invitar jugadores:", url);
    }
  }

  return (
    <Button type="button" variant="secondary" onClick={handleClick}>
      {copied ? "¡Link copiado!" : "Invitar jugadores"}
    </Button>
  );
}
