"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addSong,
  removeSong,
  setSongSemitones,
  moveSong,
  deleteSetlist,
} from "@/app/listas/actions";
import { transposedKey } from "@/lib/chords";
import type { Setlist, EventType } from "@/lib/types";

const EVENT_LABELS: Record<EventType, string> = {
  boda: "Boda",
  bautizo: "Bautizo",
  comunion: "Comunión",
  funeral: "Funeral",
  otro: "Otro",
};

type SongRow = {
  song_id: string;
  title: string;
  author: string | null;
  original_key: string | null;
  chordpro: string;
  semitones: number;
  position: number;
};

type CatalogItem = { id: string; title: string; author: string | null };

interface Props {
  setlist: Setlist;
  songs: SongRow[];
  catalog: CatalogItem[];
  shareToken: string;
}

export default function SetlistEditor({ setlist, songs, catalog, shareToken }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/lista/${shareToken}`
      : `/lista/${shareToken}`;

  function wrap(fn: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error inesperado");
      }
    });
  }

  async function handleShare() {
    const text = `Lista: ${setlist.title} ${shareUrl}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: setlist.title, url: shareUrl, text });
        return;
      } catch {
        // fallback to WhatsApp
      }
    }
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setError(null);
      // brief visual feedback via alert — acceptable for low-freq action
      alert("Enlace copiado al portapapeles");
    } catch {
      setError("No se pudo copiar el enlace");
    }
  }

  const filtered = catalog.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      (c.author?.toLowerCase().includes(q) ?? false)
    );
  });

  // Songs already in the list (to avoid duplicate adds)
  const inList = new Set(songs.map((s) => s.song_id));

  return (
    <div className="flex flex-col gap-6">
      {/* Cabecera */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold">{setlist.title}</h1>
            {setlist.event_type && (
              <p className="text-sm text-[var(--foreground)]/60">
                {EVENT_LABELS[setlist.event_type]}
              </p>
            )}
            {setlist.notes && (
              <p className="mt-1 text-sm text-[var(--foreground)]/60">{setlist.notes}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleShare}
              className="flex min-h-[44px] items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              {/* WhatsApp icon inline */}
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L.057 23.485a.5.5 0 0 0 .614.596l5.86-1.536A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.806 9.806 0 0 1-5.003-1.368l-.359-.213-3.72.976.993-3.628-.234-.374A9.792 9.792 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
              </svg>
              Compartir por WhatsApp
            </button>
            <button
              onClick={handleCopy}
              className="flex min-h-[44px] items-center rounded-lg border border-[var(--foreground)]/20 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10"
            >
              Copiar enlace
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {/* Lista de canciones */}
      <section>
        <h2 className="mb-3 font-semibold">Canciones ({songs.length})</h2>
        {songs.length === 0 ? (
          <p className="text-sm text-[var(--foreground)]/50">
            Todavía no hay canciones. Añade alguna desde el catálogo.
          </p>
        ) : (
          <ol className="flex flex-col gap-3">
            {songs.map((song, idx) => {
              const displayKey =
                song.original_key
                  ? transposedKey(song.original_key, song.semitones)
                  : null;
              return (
                <li
                  key={song.song_id}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--foreground)]/10 bg-[var(--background)] p-3"
                >
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{song.title}</p>
                    {song.author && (
                      <p className="truncate text-xs text-[var(--foreground)]/50">{song.author}</p>
                    )}
                  </div>

                  {/* Tono */}
                  <div className="flex items-center gap-1">
                    <button
                      aria-label="Bajar semitono"
                      disabled={isPending || song.semitones <= -11}
                      onClick={() =>
                        wrap(() =>
                          setSongSemitones(setlist.id, song.song_id, song.semitones - 1)
                        )
                      }
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--foreground)]/20 text-lg font-bold disabled:opacity-40 hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      −
                    </button>
                    <span className="w-14 text-center text-sm font-mono">
                      {displayKey ?? (song.semitones >= 0 ? `+${song.semitones}` : song.semitones)}
                    </span>
                    <button
                      aria-label="Subir semitono"
                      disabled={isPending || song.semitones >= 11}
                      onClick={() =>
                        wrap(() =>
                          setSongSemitones(setlist.id, song.song_id, song.semitones + 1)
                        )
                      }
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--foreground)]/20 text-lg font-bold disabled:opacity-40 hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      +
                    </button>
                  </div>

                  {/* Orden */}
                  <div className="flex gap-1">
                    <button
                      aria-label="Subir canción"
                      disabled={isPending || idx === 0}
                      onClick={() => wrap(() => moveSong(setlist.id, song.song_id, "up"))}
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--foreground)]/20 disabled:opacity-40 hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      ↑
                    </button>
                    <button
                      aria-label="Bajar canción"
                      disabled={isPending || idx === songs.length - 1}
                      onClick={() => wrap(() => moveSong(setlist.id, song.song_id, "down"))}
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--foreground)]/20 disabled:opacity-40 hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      ↓
                    </button>
                  </div>

                  {/* Quitar */}
                  <button
                    aria-label="Quitar canción"
                    disabled={isPending}
                    onClick={() => wrap(() => removeSong(setlist.id, song.song_id))}
                    className="flex h-11 w-11 items-center justify-center rounded-lg text-red-500 disabled:opacity-40 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* Añadir canción */}
      <section>
        <h2 className="mb-3 font-semibold">Añadir canción</h2>
        <input
          type="search"
          placeholder="Buscar por título o autor…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3 w-full rounded-lg border border-[var(--foreground)]/20 bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
        />
        {search.trim() && filtered.length === 0 && (
          <p className="text-sm text-[var(--foreground)]/50">Sin resultados.</p>
        )}
        <ul className="flex flex-col gap-1 max-h-72 overflow-y-auto">
          {(search.trim() ? filtered : []).map((item) => (
            <li key={item.id}>
              <button
                disabled={isPending || inList.has(item.id)}
                onClick={() => wrap(() => addSong(setlist.id, item.id))}
                className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm hover:bg-[var(--foreground)]/5 disabled:opacity-40"
              >
                <span>
                  <span className="font-medium">{item.title}</span>
                  {item.author && (
                    <span className="ml-2 text-[var(--foreground)]/50">{item.author}</span>
                  )}
                </span>
                {inList.has(item.id) ? (
                  <span className="text-xs text-[var(--foreground)]/40">Ya añadida</span>
                ) : (
                  <span className="text-[var(--brand)]">+</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Eliminar lista */}
      <section className="border-t border-[var(--foreground)]/10 pt-4">
        <button
          disabled={isPending}
          onClick={() => {
            if (confirm("¿Eliminar esta lista? Esta acción no se puede deshacer.")) {
              wrap(() => deleteSetlist(setlist.id));
            }
          }}
          className="min-h-[44px] rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-40 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
        >
          Eliminar lista
        </button>
      </section>

      {isPending && (
        <p className="text-center text-xs text-[var(--foreground)]/40">Guardando…</p>
      )}
    </div>
  );
}
