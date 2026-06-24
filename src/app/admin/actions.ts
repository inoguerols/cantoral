"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";

/** Guard compartido: lanza si el usuario no es admin. */
async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("No autorizado");
}

/**
 * Crea o actualiza una canción.
 * Si formData incluye "id", hace UPDATE; si no, INSERT.
 */
export async function createOrUpdateSong(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const id = formData.get("id") as string | null;
  const title = (formData.get("title") as string).trim();
  const author = (formData.get("author") as string | null)?.trim() || null;
  const themesRaw = (formData.get("themes") as string | null) ?? "";
  const themes = themesRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const chordpro = (formData.get("chordpro") as string).trim();
  const original_key = (formData.get("original_key") as string | null)?.trim() || null;
  const status = (formData.get("status") as string) || "published";
  const pdf_path = (formData.get("pdf_path") as string | null)?.trim() || null;

  const payload = { title, author, themes, chordpro, original_key, status, pdf_path };

  if (id) {
    const { error } = await supabase.from("songs").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("songs").insert({ ...payload, parent_id: null });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/");
}

/** Publica una alternativa pendiente (cambia status a 'published'). */
export async function publishSong(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("songs").update({ status: "published" }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/");
}

/** Rechaza y elimina una alternativa pendiente. */
export async function rejectSong(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("songs").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

/** Marca una corrección como resuelta. */
export async function resolveCorrection(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("corrections")
    .update({ status: "resolved" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}
