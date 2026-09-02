import { LinkButton } from "@/components/ui/LinkButton";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div>
          <p className="text-sm font-medium text-primary">Catanero</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight">Tu liga de Catan.</h1>
          <p className="mt-3 text-muted">
            Registrá partidas, seguí el ranking y las estadísticas de tu grupo. Se acabó
            anotar los puntos por WhatsApp.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3">
          {user ? (
            <LinkButton href="/dashboard" fullWidth>
              Ir a mis ligas
            </LinkButton>
          ) : (
            <>
              <LinkButton href="/login" fullWidth>
                Crear mi liga
              </LinkButton>
              <LinkButton href="/login" variant="secondary" fullWidth>
                Iniciar sesión
              </LinkButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
