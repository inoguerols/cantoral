import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import type { Song } from "@/lib/types";
import SongView from "@/components/SongView";

export default async function SongPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Canción principal
  const { data: song } = await supabase
    .from("songs")
    .select("*")
    .eq("id", id)
    .in("status", ["published"])
    .maybeSingle();

  if (!song) notFound();

  // Alternativas publicadas
  const { data: alternatives } = await supabase
    .from("songs")
    .select("id, title, author")
    .eq("parent_id", id)
    .eq("status", "published");

  // Media de valoraciones
  const { data: ratings } = await supabase
    .from("ratings")
    .select("stars")
    .eq("song_id", id);

  const ratingCount = ratings?.length ?? 0;
  const avgRating =
    ratingCount > 0
      ? (ratings!.reduce((sum, r) => sum + r.stars, 0) / ratingCount)
      : 0;

  // Usuario actual
  const user = await getUser();

  // URL pública del PDF si existe
  let pdfUrl: string | null = null;
  if ((song as Song).pdf_path) {
    const { data } = supabase.storage
      .from("songs-pdfs")
      .getPublicUrl((song as Song).pdf_path!);
    pdfUrl = data.publicUrl;
  }

  const s = song as Song;

  return (
    <SongView
      songId={s.id}
      title={s.title}
      author={s.author}
      themes={s.themes}
      chordpro={s.chordpro}
      originalKey={s.original_key ?? ""}
      pdfUrl={pdfUrl}
      alternatives={(alternatives ?? []) as { id: string; title: string; author: string | null }[]}
      avgRating={avgRating}
      ratingCount={ratingCount}
      isLoggedIn={!!user}
    />
  );
}
