import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Song } from "@/lib/types";
import SongCard from "@/components/SongCard";
import SearchBar from "@/components/SearchBar";

interface Props {
  searchParams: Promise<{ q?: string; theme?: string; author?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const { q, theme, author } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("songs")
    .select("*")
    .eq("status", "published")
    .is("parent_id", null)
    .order("title");

  if (q) query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%`);
  if (theme) query = query.contains("themes", [theme]);
  if (author) query = query.eq("author", author);

  const { data: songs } = await query;
  const lista = (songs ?? []) as Song[];

  // Facetas para navegar (autores y temas existentes).
  const { data: facetData } = await supabase
    .from("songs")
    .select("author, themes")
    .eq("status", "published")
    .is("parent_id", null);
  const autores = Array.from(
    new Set((facetData ?? []).map((r) => r.author as string | null).filter(Boolean) as string[]),
  ).sort((a, b) => a.localeCompare(b, "es"));
  const temas = Array.from(
    new Set((facetData ?? []).flatMap((r) => (r.themes as string[] | null) ?? [])),
  ).sort((a, b) => a.localeCompare(b, "es"));

  const sinFiltros = !q && !theme && !author;
  const chip =
    "rounded-full border border-current/15 px-3 py-1 text-sm opacity-80 hover:opacity-100 hover:border-current/40";

  return (
    <div className="px-1 py-2">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--brand)" }}>
            Cantoral
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Cancionero parroquial con acordes
          </p>
        </header>

        <Suspense>
          <SearchBar defaultValue={q ?? ""} />
        </Suspense>

        {/* Filtros activos */}
        {(theme || author) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {theme && (
              <span className="rounded-full px-2.5 py-0.5 font-medium" style={{ background: "color-mix(in srgb, var(--brand) 12%, transparent)", color: "var(--brand)" }}>
                Tema: {theme}
              </span>
            )}
            {author && (
              <span className="rounded-full px-2.5 py-0.5 font-medium" style={{ background: "color-mix(in srgb, var(--brand) 12%, transparent)", color: "var(--brand)" }}>
                Autor: {author}
              </span>
            )}
            <Link href="/" className="text-zinc-400 underline hover:text-zinc-600" aria-label="Quitar filtros">✕ quitar</Link>
          </div>
        )}

        {/* Explorar por autor / tema */}
        {(autores.length > 0 || temas.length > 0) && (
          <details className="mt-4 rounded-xl border border-current/10 p-3" open={sinFiltros}>
            <summary className="cursor-pointer text-sm font-medium opacity-80">
              Explorar por autor o tema
            </summary>
            {autores.length > 0 && (
              <div className="mt-3">
                <p className="mb-1 text-xs uppercase tracking-wide opacity-50">Autores</p>
                <div className="flex flex-wrap gap-2">
                  {autores.map((a) => (
                    <Link key={a} href={`/?author=${encodeURIComponent(a)}`} className={chip}>{a}</Link>
                  ))}
                </div>
              </div>
            )}
            {temas.length > 0 && (
              <div className="mt-3">
                <p className="mb-1 text-xs uppercase tracking-wide opacity-50">Temas</p>
                <div className="flex flex-wrap gap-2">
                  {temas.map((t) => (
                    <Link key={t} href={`/?theme=${encodeURIComponent(t)}`} className={chip}>{t}</Link>
                  ))}
                </div>
              </div>
            )}
          </details>
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
                  <p className="mt-2 text-base">Sin resultados.</p>
                  <Link href="/" className="mt-3 inline-block text-sm underline" style={{ color: "var(--brand)" }}>
                    Ver todas las canciones
                  </Link>
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
    </div>
  );
}
