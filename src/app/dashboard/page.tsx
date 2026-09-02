import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateLeagueForm } from "@/components/dashboard/CreateLeagueForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { getUserLeagues } from "@/lib/data/leagues";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const leagues = await getUserLeagues(user.id);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-8 sm:max-w-2xl lg:max-w-3xl">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Catanero</p>
          <h1 className="text-2xl font-semibold">Mis ligas</h1>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-sm text-muted hover:text-foreground">
            Salir
          </button>
        </form>
      </header>

      <div className="mt-6 flex flex-col gap-3">
        {leagues.map((league) => (
          <Link
            key={league.id}
            href={`/league/${league.slug}`}
            className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-4 transition-colors hover:bg-black/[.02] dark:hover:bg-white/[.03]"
          >
            <div>
              <p className="text-[15px] font-medium">{league.name}</p>
              <p className="text-sm text-muted">
                {league.playerCount} {league.playerCount === 1 ? "jugador" : "jugadores"}
              </p>
            </div>
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              {league.role === "admin" ? "Admin" : "Jugador"}
            </span>
          </Link>
        ))}

        {leagues.length === 0 ? (
          <EmptyState
            title="Todavía no tenés ninguna liga."
            description="Creá la primera para empezar a registrar partidas."
          />
        ) : null}
      </div>

      <div className="mt-8">
        <CreateLeagueForm />
      </div>
    </div>
  );
}
