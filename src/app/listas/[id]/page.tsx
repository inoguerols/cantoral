import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import type { Setlist } from "@/lib/types";
import SetlistEditor from "@/components/SetlistEditor";

export default async function SetlistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getUser();
  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-lg">Necesitas iniciar sesión para ver esta lista.</p>
        <Link
          href="/login"
          className="rounded-lg bg-[var(--brand)] px-5 py-3 font-medium text-white hover:opacity-90"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  const supabase = await createClient();

  // Cargar la setlist
  const { data: setlist } = await supabase
    .from("setlists")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!setlist || (setlist as Setlist).created_by !== user.id) notFound();

  const sl = setlist as Setlist;

  // Canciones de la lista con datos de song
  const { data: slSongs } = await supabase
    .from("setlist_songs")
    .select("song_id, position, semitones")
    .eq("setlist_id", id)
    .order("position", { ascending: true });

  const songIds = (slSongs ?? []).map((r) => r.song_id);

  let songMap: Record<
    string,
    { title: string; author: string | null; original_key: string | null; chordpro: string }
  > = {};

  if (songIds.length > 0) {
    const { data: songRows } = await supabase
      .from("songs")
      .select("id, title, author, original_key, chordpro")
      .in("id", songIds);
    for (const s of songRows ?? []) {
      songMap[s.id] = {
        title: s.title,
        author: s.author,
        original_key: s.original_key,
        chordpro: s.chordpro,
      };
    }
  }

  const songs = (slSongs ?? []).map((r) => ({
    song_id: r.song_id,
    position: r.position,
    semitones: r.semitones,
    title: songMap[r.song_id]?.title ?? r.song_id,
    author: songMap[r.song_id]?.author ?? null,
    original_key: songMap[r.song_id]?.original_key ?? null,
    chordpro: songMap[r.song_id]?.chordpro ?? "",
  }));

  // Catálogo para añadir
  const { data: catalog } = await supabase
    .from("songs")
    .select("id, title, author")
    .eq("status", "published")
    .is("parent_id", null)
    .order("title", { ascending: true });

  return (
    <SetlistEditor
      setlist={sl}
      songs={songs}
      catalog={(catalog ?? []) as { id: string; title: string; author: string | null }[]}
      shareToken={sl.share_token}
    />
  );
}
