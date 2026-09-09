import type { ReactNode } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BottomNav } from "@/components/league/BottomNav";
import { signOut } from "@/app/login/actions";
import { getLeagueBySlug, getMembership, getPlayerForUser } from "@/lib/data/leagues";
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

  const viewerPlayer = await getPlayerForUser(league.id, user.id);

  return (
    <div className="theme-liga min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col sm:max-w-2xl sm:border-x sm:border-border lg:max-w-3xl">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
          <Link href="/dashboard" className="text-sm font-medium text-primary">
            ← Mis ligas
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {viewerPlayer?.displayName ?? "Vos"}
              </p>
              <p className="text-xs text-muted">{league.name}</p>
            </div>
            <form action={signOut}>
              <button type="submit" className="text-xs text-muted hover:text-foreground">
                Salir
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 px-4 pb-28 pt-6 sm:px-6">{children}</main>
        <BottomNav slug={slug} />
      </div>
    </div>
  );
}
