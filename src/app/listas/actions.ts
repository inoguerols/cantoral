"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

async function requireUser() {
  const user = await getUser();
  if (!user) throw new Error("Necesitas iniciar sesión");
  return user;
}

/** Crea una lista y redirige a su editor. */
export async function createSetlist(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const title = (formData.get("title") as string)?.trim();
  if (!title) throw new Error("La lista necesita un título");
  const event_type = (formData.get("event_type") as string) || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  const { data, error } = await supabase
    .from("setlists")
    .insert({ title, event_type, notes, created_by: user.id })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/listas");
  redirect(`/listas/${data.id}`);
}

export async function updateSetlist(formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const title = (formData.get("title") as string)?.trim();
  const event_type = (formData.get("event_type") as string) || null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const { error } = await supabase
    .from("setlists")
    .update({ title, event_type, notes })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/listas/${id}`);
}

export async function deleteSetlist(id: string) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("setlists").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/listas");
  redirect("/listas");
}

/** Añade una canción al final de la lista. */
export async function addSong(setlistId: string, songId: string) {
  await requireUser();
  const supabase = await createClient();
  const { data: last } = await supabase
    .from("setlist_songs")
    .select("position")
    .eq("setlist_id", setlistId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (last?.position ?? -1) + 1;
  const { error } = await supabase
    .from("setlist_songs")
    .insert({ setlist_id: setlistId, song_id: songId, position, semitones: 0 });
  if (error) throw new Error(error.message);
  revalidatePath(`/listas/${setlistId}`);
}

export async function removeSong(setlistId: string, songId: string) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("setlist_songs")
    .delete()
    .eq("setlist_id", setlistId)
    .eq("song_id", songId);
  if (error) throw new Error(error.message);
  revalidatePath(`/listas/${setlistId}`);
}

/** Fija el tono marcado (transposición en semitonos) de una canción de la lista. */
export async function setSongSemitones(setlistId: string, songId: string, semitones: number) {
  await requireUser();
  const supabase = await createClient();
  const clamped = Math.max(-11, Math.min(11, Math.trunc(semitones)));
  const { error } = await supabase
    .from("setlist_songs")
    .update({ semitones: clamped })
    .eq("setlist_id", setlistId)
    .eq("song_id", songId);
  if (error) throw new Error(error.message);
  revalidatePath(`/listas/${setlistId}`);
}

/** Sube o baja una canción intercambiando posición con su vecina. */
export async function moveSong(setlistId: string, songId: string, dir: "up" | "down") {
  await requireUser();
  const supabase = await createClient();
  const { data: rows, error: e1 } = await supabase
    .from("setlist_songs")
    .select("song_id, position")
    .eq("setlist_id", setlistId)
    .order("position", { ascending: true });
  if (e1) throw new Error(e1.message);
  if (!rows) return;
  const idx = rows.findIndex((r) => r.song_id === songId);
  const swapIdx = dir === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= rows.length) return;

  const a = rows[idx];
  const b = rows[swapIdx];
  // Intercambia posiciones (dos updates).
  await supabase
    .from("setlist_songs")
    .update({ position: b.position })
    .eq("setlist_id", setlistId)
    .eq("song_id", a.song_id);
  await supabase
    .from("setlist_songs")
    .update({ position: a.position })
    .eq("setlist_id", setlistId)
    .eq("song_id", b.song_id);
  revalidatePath(`/listas/${setlistId}`);
}
