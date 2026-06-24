import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { transposedKey, renderChordPro } from "@/lib/chords";
import { SharedSetlist } from "@/lib/types";
import ShareButton from "@/components/ShareButton";

const EVENT_LABELS: Record<string, string> = {
  boda: "Boda",
  bautizo: "Bautizo",
  comunion: "Comunión",
  funeral: "Funeral",
  otro: "Otro",
};

export default async function PublicSetlistPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_shared_setlist", { p_token: token });

  if (!data) notFound();

  const setlist = data as SharedSetlist;

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Cabecera */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{setlist.title}</h1>
          <ShareButton title={setlist.title} />
        </div>
        {setlist.event_type && (
          <p className="text-sm font-medium text-indigo-600">
            {EVENT_LABELS[setlist.event_type] ?? setlist.event_type}
          </p>
        )}
        {setlist.notes && (
          <p className="text-sm text-gray-600 whitespace-pre-line">{setlist.notes}</p>
        )}
      </div>

      {/* Programa */}
      <ol className="space-y-6">
        {setlist.songs.map((song, i) => {
          const tono = song.original_key
            ? transposedKey(song.original_key, song.semitones)
            : song.semitones !== 0
            ? `transpuesto ${song.semitones > 0 ? "+" : ""}${song.semitones}`
            : "Original";

          return (
            <li key={song.song_id} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-indigo-500 tabular-nums w-8 shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-lg leading-tight">
                    {song.title}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-0.5">
                    {song.author && (
                      <span className="text-sm text-gray-500">{song.author}</span>
                    )}
                    <span className="text-sm font-medium text-indigo-600">
                      Tono: {tono}
                    </span>
                  </div>
                </div>
              </div>

              {song.chordpro ? (
                <div
                  className="chord-sheet overflow-x-auto"
                  dangerouslySetInnerHTML={{
                    __html: renderChordPro(song.chordpro, song.semitones),
                  }}
                />
              ) : (
                <p className="text-sm text-gray-500 italic">
                  <a href="/login" className="text-indigo-600 underline underline-offset-2">
                    Inicia sesión
                  </a>{" "}
                  para ver los acordes.
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </main>
  );
}
