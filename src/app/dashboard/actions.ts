"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface CreateLeagueState {
  error: string | null;
}

function slugify(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "liga"
  );
}

export async function createLeague(
  _prevState: CreateLeagueState,
  formData: FormData
): Promise<CreateLeagueState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Ingresá un nombre para tu liga." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const baseSlug = slugify(name);
  let createdSlug: string | null = null;

  // No usamos .select() sobre el insert: el RETURNING quedaría sujeto a la
  // policy de SELECT de "leagues" (ser miembro de la liga), y el trigger que
  // te agrega como admin en league_members corre recién después del insert.
  // Como el slug lo generamos acá mismo, no hace falta que la DB lo devuelva.
  for (let attempt = 0; attempt < 5 && !createdSlug; attempt += 1) {
    const candidateSlug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const { error } = await supabase
      .from("leagues")
      .insert({ name, slug: candidateSlug, created_by: user.id });

    if (!error) {
      createdSlug = candidateSlug;
    } else if (error.code !== "23505") {
      return { error: "No pudimos crear la liga. Probá de nuevo." };
    }
  }

  if (!createdSlug) {
    return { error: "No pudimos generar un identificador único para la liga." };
  }

  redirect(`/league/${createdSlug}`);
}

export interface DeleteLeagueState {
  error: string | null;
}

export async function deleteLeague(
  leagueId: string,
  _prevState: DeleteLeagueState,
  _formData: FormData
): Promise<DeleteLeagueState> {
  const supabase = await createClient();
  const { error } = await supabase.from("leagues").delete().eq("id", leagueId);

  if (error) {
    return { error: "No se pudo eliminar la liga. ¿Tenés permisos de administrador?" };
  }

  revalidatePath("/dashboard");
  return { error: null };
}
