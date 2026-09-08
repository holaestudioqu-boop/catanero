import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative h-48 overflow-hidden bg-carbon lg:hidden">
        <Image
          src="/brand/hero-landing.jpg"
          alt=""
          fill
          className="object-cover object-[60%_70%] opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-carbon/40 to-carbon/90" />
        <div className="relative flex h-full items-start p-6">
          <Image
            src="/brand/logo-mark-cream.png"
            alt="Catanero"
            width={168}
            height={158}
            className="h-10 w-auto"
          />
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-carbon px-10 py-10 lg:flex lg:flex-col lg:justify-between">
        <Image
          src="/brand/hero-landing.jpg"
          alt=""
          fill
          className="object-cover object-[60%_65%] opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-carbon/50 via-carbon/70 to-carbon/95" />

        <Image
          src="/brand/logo-mark-cream.png"
          alt="Catanero"
          width={168}
          height={158}
          className="relative h-11 w-auto self-start"
        />

        <h2 className="font-editorial relative max-w-sm text-4xl leading-[1.15] text-crema xl:text-5xl">
          Bienvenido a nuevas historias.
        </h2>
      </div>

      <div className="flex flex-1 flex-col justify-center bg-background px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="font-editorial text-3xl font-semibold text-foreground">
            Bienvenido a Catanero
          </h1>
          <p className="mt-2 text-sm text-muted">
            Iniciá sesión o creá una cuenta para armar tu liga.
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
