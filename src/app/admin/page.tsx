import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Song, Correction } from "@/lib/types";
import SongEditor from "@/components/admin/SongEditor";
import { publishSong, rejectSong, resolveCorrection } from "./actions";

export const metadata = { title: "Administración — Cantoral" };

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/");

  const supabase = await createClient();

  // Canciones oficiales publicadas (parent_id null)
  const { data: songs } = await supabase
    .from("songs")
    .select("*")
    .eq("status", "published")
    .is("parent_id", null)
    .order("title");

  // Cola: alternativas pendientes
  const { data: pending } = await supabase
    .from("songs")
    .select("*")
    .eq("status", "pending")
    .order("created_at");

  // Correcciones abiertas con el título de la canción
  const { data: corrections } = await supabase
    .from("corrections")
    .select("*, songs(title)")
    .eq("status", "open")
    .order("created_at");

  const publishedSongs = (songs ?? []) as Song[];
  const pendingSongs = (pending ?? []) as Song[];
  // ponytail: cast mínimo; el join songs(title) llega como { songs: { title } }
  const openCorrections = (corrections ?? []) as (Correction & { songs: { title: string } | null })[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-16">
      <h1 className="text-2xl font-bold" style={{ color: "var(--brand)" }}>
        Panel de administración
      </h1>

      {/* ── 1. Nueva canción ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Nueva canción</h2>
        <SongEditor />
      </section>

      <hr className="border-zinc-200 dark:border-zinc-700" />

      {/* ── 2. Cola de aprobación ── */}
      <section className="space-y-8">
        <h2 className="text-xl font-semibold">
          Cola de aprobación
          {(pendingSongs.length + openCorrections.length) > 0 && (
            <span
              className="ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold text-white"
              style={{ background: "var(--brand)" }}
            >
              {pendingSongs.length + openCorrections.length}
            </span>
          )}
        </h2>

        {/* Alternativas pendientes */}
        <div className="space-y-3">
          <h3 className="text-base font-medium text-zinc-600 dark:text-zinc-400">
            Versiones alternativas pendientes ({pendingSongs.length})
          </h3>
          {pendingSongs.length === 0 ? (
            <p className="text-sm text-zinc-400">Sin alternativas pendientes.</p>
          ) : (
            <ul className="space-y-3">
              {pendingSongs.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{s.title}</p>
                    {s.author && (
                      <p className="text-sm text-zinc-500">{s.author}</p>
                    )}
                    <p className="mt-1 text-xs text-zinc-400 font-mono truncate">
                      {s.chordpro.slice(0, 80)}…
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <form
                      action={async () => {
                        "use server";
                        await publishSong(s.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="min-h-[44px] rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ background: "var(--brand)" }}
                      >
                        Publicar
                      </button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await rejectSong(s.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="min-h-[44px] rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        Rechazar
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Correcciones abiertas */}
        <div className="space-y-3">
          <h3 className="text-base font-medium text-zinc-600 dark:text-zinc-400">
            Correcciones abiertas ({openCorrections.length})
          </h3>
          {openCorrections.length === 0 ? (
            <p className="text-sm text-zinc-400">Sin correcciones pendientes.</p>
          ) : (
            <ul className="space-y-3">
              {openCorrections.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      {c.songs?.title ?? "Canción eliminada"}
                    </p>
                    <p className="mt-1 text-sm">{c.body}</p>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await resolveCorrection(c.id);
                    }}
                    className="shrink-0"
                  >
                    <button
                      type="submit"
                      className="min-h-[44px] rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
                    >
                      Marcar resuelta
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <hr className="border-zinc-200 dark:border-zinc-700" />

      {/* ── 3. Canciones publicadas para editar ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          Canciones publicadas ({publishedSongs.length})
        </h2>
        {publishedSongs.length === 0 ? (
          <p className="text-sm text-zinc-400">No hay canciones publicadas aún.</p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {publishedSongs.map((s) => (
              <li key={s.id} className="py-3">
                {/* ponytail: acordeón inline; si la lista crece conviene una ruta /admin/songs/[id] */}
                <details className="group">
                  <summary className="flex cursor-pointer items-center justify-between gap-2 list-none">
                    <div>
                      <span className="font-medium">{s.title}</span>
                      {s.author && (
                        <span className="ml-2 text-sm text-zinc-500">{s.author}</span>
                      )}
                      {s.original_key && (
                        <span className="ml-2 text-xs text-zinc-400">({s.original_key})</span>
                      )}
                    </div>
                    <span className="text-sm text-zinc-400 group-open:hidden">Editar ▸</span>
                    <span className="text-sm text-zinc-400 hidden group-open:inline">Cerrar ▴</span>
                  </summary>
                  <div className="mt-4">
                    <SongEditor song={s} />
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
