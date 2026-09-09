import { redirect } from "next/navigation";
import { CreateLeagueForm } from "@/components/dashboard/CreateLeagueForm";
import { LeagueCard } from "@/components/dashboard/LeagueCard";
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
    <div className="min-h-dvh bg-background px-4 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <span className="font-editorial text-2xl text-foreground">Catanero</span>
          <form action={signOut}>
            <button type="submit" className="text-sm text-muted hover:text-foreground">
              Salir
            </button>
          </form>
        </header>

        <section className="relative overflow-hidden rounded-[var(--radius-lg)] bg-carbon shadow-[var(--shadow-editorial)]">
          <div className="h-1.5 bg-naranja" />
          <div className="p-6 sm:p-8">
            <p className="text-xs font-medium tracking-[0.08em] text-crema/60 uppercase">
              Mis ligas
            </p>
            <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h1 className="font-editorial text-4xl text-crema sm:text-5xl">
                Tus crónicas
              </h1>
              <CreateLeagueForm />
            </div>

            {leagues.length > 0 ? (
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {leagues.map((league) => (
                  <LeagueCard key={league.id} league={league} />
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-[var(--radius-sm)] border border-dashed border-white/15 px-6 py-12 text-center">
                <p className="font-editorial text-2xl text-crema">
                  Todavía no empezó la historia.
                </p>
                <p className="mt-2 text-sm text-crema/50">
                  Creá tu primera liga para empezar a registrar partidas.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
