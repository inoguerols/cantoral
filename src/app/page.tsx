import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Song } from "@/lib/types";
import SongCard from "@/components/SongCard";
import SearchBar from "@/components/SearchBar";

interface Props {
  searchParams: Promise<{ q?: string; theme?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const { q, theme } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("songs")
    .select("*")
    .eq("status", "published")
    .is("parent_id", null)
    .order("title");

  if (q) {
    query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%`);
  }
  if (theme) {
    query = query.contains("themes", [theme]);
  }

  const { data: songs } = await query;
  const lista = (songs ?? []) as Song[];

  const sinFiltros = !q && !theme;

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Cabecera de marca */}
        <header className="mb-8 text-center">
          <h1
            className="text-4xl font-bold tracking-tight"
            style={{ color: "var(--brand)" }}
          >
            Cantoral
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Cancionero parroquial con acordes
          </p>
        </header>

        {/* Buscador — necesita Suspense porque useSearchParams es dinámico */}
        <Suspense>
          <SearchBar defaultValue={q ?? ""} />
        </Suspense>

        {/* Filtro de tema activo */}
        {theme && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-zinc-500">Tema:</span>
            <span
              className="rounded-full px-2.5 py-0.5 font-medium"
              style={{
                background: "color-mix(in srgb, var(--brand) 12%, transparent)",
                color: "var(--brand)",
              }}
            >
              {theme}
            </span>
            <a
              href="/"
              className="ml-1 text-zinc-400 underline hover:text-zinc-600"
              aria-label="Quitar filtro de tema"
            >
              ✕
            </a>
          </div>
        )}

        {/* Resultados */}
        <section className="mt-6">
          {lista.length === 0 ? (
            <div className="py-16 text-center text-zinc-400">
              {sinFiltros ? (
                <>
                  <p className="text-2xl">♪</p>
                  <p className="mt-2 text-base">Aún no hay canciones.</p>
                </>
              ) : (
                <>
                  <p className="text-2xl">🔍</p>
                  <p className="mt-2 text-base">Sin resultados para tu búsqueda.</p>
                  <a
                    href="/"
                    className="mt-3 inline-block text-sm underline"
                    style={{ color: "var(--brand)" }}
                  >
                    Ver todas las canciones
                  </a>
                </>
              )}
            </div>
          ) : (
            <>
              <p className="mb-4 text-xs text-zinc-400">
                {lista.length} {lista.length === 1 ? "canción" : "canciones"}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {lista.map((song) => (
                  <SongCard key={song.id} song={song} />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
