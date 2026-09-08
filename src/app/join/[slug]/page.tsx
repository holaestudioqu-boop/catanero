import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { createClient } from "@/lib/supabase/server";
import { joinLeagueAction } from "./actions";

export default async function JoinLeaguePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const [
    {
      data: { user },
    },
    { data: previewRows },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc("get_league_preview", { p_slug: slug }),
  ]);

  const preview = previewRows?.[0];
  if (!preview) notFound();

  if (user && preview.already_member) {
    redirect(`/league/${slug}`);
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <Image
        src="/brand/hero-landing.jpg"
        alt=""
        fill
        className="object-cover object-[55%_60%] opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-crema via-crema/95 to-crema" />

      <div className="relative flex w-full max-w-sm flex-col items-center">
        <p className="text-sm font-medium text-primary">Catanero</p>
        <h1 className="font-editorial mt-2 text-4xl text-foreground">Te invitaron a jugar</h1>
        <p className="mt-3 text-lg text-foreground">{preview.name}</p>
        <p className="mt-1 text-sm text-muted">
          {preview.player_count} {preview.player_count === 1 ? "jugador" : "jugadores"} ya
          forman parte de esta liga.
        </p>

        {user ? (
          <form action={joinLeagueAction.bind(null, slug)} className="mt-8 w-full">
            <Button type="submit" fullWidth>
              Unirme a la liga
            </Button>
          </form>
        ) : (
          <div className="mt-8 flex w-full flex-col gap-3">
            <LinkButton
              href={`/login?next=${encodeURIComponent(`/join/${slug}`)}`}
              fullWidth
            >
              Crear cuenta para unirme
            </LinkButton>
            <p className="text-xs text-muted">
              ¿Ya tenés cuenta en Catanero? Iniciá sesión desde el mismo botón.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
