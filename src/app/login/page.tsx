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
    <div className="flex min-h-dvh flex-col justify-center px-6 py-16">
      <div className="mx-auto w-full max-w-sm">
        <p className="text-sm font-medium text-primary">Catanero</p>
        <h1 className="mt-1 text-2xl font-semibold">Tu liga de Catan</h1>
        <p className="mt-2 text-sm text-muted">
          Iniciá sesión o creá una cuenta para armar tu liga.
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
