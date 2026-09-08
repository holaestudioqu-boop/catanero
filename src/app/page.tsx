import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <Image
        src="/brand/hero-landing.jpg"
        alt=""
        fill
        priority
        className="object-cover object-[62%_75%] sm:object-[center_60%]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-carbon/70 via-carbon/20 to-carbon/85" />

      <div className="relative flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-6 py-6 sm:px-10">
          <Image
            src="/brand/logo-mark-cream.png"
            alt="Catanero"
            width={168}
            height={158}
            className="h-11 w-auto sm:h-12"
            priority
          />
          <Link
            href={user ? "/dashboard" : "/login"}
            className="rounded-[var(--radius-control)] border border-dorado/70 bg-carbon/40 px-5 py-2.5 text-sm font-medium text-crema backdrop-blur-sm transition-colors hover:bg-carbon/60"
          >
            {user ? "Ir a mis ligas" : "Ingresar"}
          </Link>
        </header>

        <main className="flex flex-1 items-end px-6 pb-16 sm:px-10 sm:pb-24">
          <div className="max-w-xl">
            <h1 className="font-editorial text-[2.75rem] leading-[1.08] font-semibold text-crema sm:text-6xl lg:text-7xl">
              Tu grupo. Tu liga. Tu historia.
            </h1>
            <p className="mt-5 max-w-md text-base text-crema/80 sm:text-lg">
              Registrá partidas, seguí el ranking y construí la historia de tu
              liga.
            </p>
            <Link
              href={user ? "/dashboard" : "/login"}
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] bg-naranja px-7 text-[15px] font-medium text-white shadow-[var(--shadow-editorial)] transition-opacity hover:opacity-90"
            >
              {user ? "Ir a mis ligas" : "Crear mi liga"}
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
