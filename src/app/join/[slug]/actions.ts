"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function joinLeagueAction(slug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/join/${slug}`)}`);
  }

  const { error } = await supabase.rpc("join_league", { p_slug: slug });

  if (error) {
    redirect(`/join/${slug}?error=1`);
  }

  redirect(`/league/${slug}`);
}
