import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { BottomNav } from "@/components/league/BottomNav";
import { getLeagueBySlug, getMembership } from "@/lib/data/leagues";
import { createClient } from "@/lib/supabase/server";

export default async function LeagueLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const league = await getLeagueBySlug(slug);
  if (!league) {
    notFound();
  }

  const role = await getMembership(league.id, user.id);
  if (!role) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <p className="text-lg font-medium">No tenés acceso a esta liga.</p>
        <p className="mt-2 text-sm text-muted">Pedile a un administrador que te agregue.</p>
      </div>
    );
  }

  return (
    <div className="theme-liga min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col sm:max-w-2xl sm:border-x sm:border-border lg:max-w-3xl">
        <main className="flex-1 px-4 pb-28 pt-6 sm:px-6">{children}</main>
        <BottomNav slug={slug} />
      </div>
    </div>
  );
}
