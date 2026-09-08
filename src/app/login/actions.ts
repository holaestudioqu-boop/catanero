"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export interface AuthActionState {
  status: "idle" | "error" | "info";
  message: string | null;
}

/** Solo rutas internas: evita que "next" se use para redirigir a un sitio externo. */
function safeNextPath(raw: FormDataEntryValue | null): string {
  const value = String(raw ?? "");
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export async function signIn(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  if (!email || !password) {
    return { status: "error", message: "Completá tu email y contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { status: "error", message: "Email o contraseña incorrectos." };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUp(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  const next = safeNextPath(formData.get("next"));

  if (!displayName) {
    return { status: "error", message: "Ingresá tu nombre." };
  }
  if (!email || password.length < 6) {
    return { status: "error", message: "La contraseña debe tener al menos 6 caracteres." };
  }

  const headerList = await headers();
  const origin = headerList.get("origin") ?? `http://${headerList.get("host")}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  return {
    status: "info",
    message: "Te enviamos un email para confirmar tu cuenta. Confirmalo y después iniciá sesión.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
