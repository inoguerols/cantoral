"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { renderChordPro, transposedKey } from "@/lib/chords";
import SongRating from "@/components/SongRating";
import SuggestionForms from "@/components/SuggestionForms";

const FS_KEY = "cantoral:fontSize";
const FS_MIN = 0.8;
const FS_MAX = 2.0;
const FS_STEP = 0.15;
const FS_DEFAULT = 1.05;

interface Alternative { id: string; title: string; author: string | null }

interface Props {
  songId: string;
  title: string;
  author: string | null;
  themes: string[];
  chordpro: string;
  originalKey: string;
  pdfUrl: string | null;
  alternatives: Alternative[];
  avgRating: number;
  ratingCount: number;
  isLoggedIn: boolean;
}

export default function SongView({
  songId, title, author, themes, chordpro, originalKey,
  pdfUrl, alternatives, avgRating, ratingCount, isLoggedIn,
}: Props) {
  const [semitones, setSemitones] = useState(0);
  const [fontSize, setFontSize] = useState(FS_DEFAULT);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Restaura tamaño de letra del localStorage al montar
  useEffect(() => {
    const stored = localStorage.getItem(FS_KEY);
    if (stored) {
      const n = parseFloat(stored);
      if (!isNaN(n) && n >= FS_MIN && n <= FS_MAX) setFontSize(n);
    }
  }, []);

  // Persiste tamaño y aplica la CSS var al contenedor de partitura
  useEffect(() => {
    localStorage.setItem(FS_KEY, String(fontSize));
    if (sheetRef.current) {
      sheetRef.current.style.setProperty("--song-font-size", `${fontSize}rem`);
    }
  }, [fontSize]);

  function cambiarSemitonos(delta: number) {
    setSemitones((s) => Math.max(-11, Math.min(11, s + delta)));
  }

  function cambiarFontSize(delta: number) {
    setFontSize((f) => {
      const next = Math.round((f + delta) * 100) / 100;
      return Math.max(FS_MIN, Math.min(FS_MAX, next));
    });
  }

  const claveMostrada = originalKey ? transposedKey(originalKey, semitones) : null;

  const btnBase =
    "min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg font-bold text-sm select-none transition-opacity active:opacity-60 border border-current/20 px-3";
  const btnBrand = `${btnBase} text-white`;

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Barra de controles sticky ── */}
      <div className="sticky top-0 z-20 bg-[var(--background)]/90 backdrop-blur border-b border-current/10 px-4 py-2">
        <div className="max-w-2xl mx-auto flex flex-wrap items-center gap-2">
          {/* Transposición */}
          <div className="flex items-center gap-1">
            <span className="text-xs opacity-60 mr-1">Tono</span>
            <button
              className={btnBrand}
              style={{ background: "var(--brand)" }}
              onClick={() => cambiarSemitonos(-1)}
              disabled={semitones <= -11}
              aria-label="Bajar semitono"
            >−</button>
            <span className="min-w-[3.5rem] text-center text-sm font-semibold tabular-nums">
              {claveMostrada ?? (semitones === 0 ? "Original" : `${semitones > 0 ? "+" : ""}${semitones}`)}
            </span>
            <button
              className={btnBrand}
              style={{ background: "var(--brand)" }}
              onClick={() => cambiarSemitonos(1)}
              disabled={semitones >= 11}
              aria-label="Subir semitono"
            >+</button>
            {semitones !== 0 && (
              <button
                className={`${btnBase} text-xs opacity-70`}
                onClick={() => setSemitones(0)}
                aria-label="Restablecer tono"
              >Reset</button>
            )}
          </div>

          {/* Separador visual */}
          <span className="opacity-20 select-none">|</span>

          {/* Tamaño de letra */}
          <div className="flex items-center gap-1">
            <button
              className={btnBase}
              onClick={() => cambiarFontSize(-FS_STEP)}
              disabled={fontSize <= FS_MIN}
              aria-label="Reducir tamaño de letra"
            ><span style={{ fontSize: "0.75rem" }}>A</span></button>
            <button
              className={btnBase}
              onClick={() => cambiarFontSize(FS_STEP)}
              disabled={fontSize >= FS_MAX}
              aria-label="Aumentar tamaño de letra"
            ><span style={{ fontSize: "1.1rem" }}>A</span></button>
          </div>
        </div>
      </div>

      {/* ── Contenido ── */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        {/* Cabecera */}
        <div>
          <h1 className="text-2xl font-bold leading-tight">{title}</h1>
          {author && <p className="text-sm opacity-60 mt-0.5">{author}</p>}
          {themes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {themes.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-0.5 rounded-full border border-current/20 opacity-70"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-sm underline underline-offset-2"
              style={{ color: "var(--brand)" }}
            >
              Ver PDF original ↗
            </a>
          )}
        </div>

        {/* Partitura */}
        <div ref={sheetRef}>
          <div
            className="chord-sheet"
            dangerouslySetInnerHTML={{ __html: renderChordPro(chordpro, semitones) }}
          />
        </div>

        {/* Alternativas */}
        {alternatives.length > 0 && (
          <section>
            <h2 className="font-semibold mb-2 text-sm uppercase tracking-wide opacity-60">
              Versiones alternativas
            </h2>
            <ul className="flex flex-col gap-1">
              {alternatives.map((alt) => (
                <li key={alt.id}>
                  <Link
                    href={`/song/${alt.id}`}
                    className="text-sm underline underline-offset-2"
                    style={{ color: "var(--brand)" }}
                  >
                    {alt.title}{alt.author ? ` — ${alt.author}` : ""}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Valoración + formularios */}
        <section className="border-t border-current/10 pt-4 flex flex-col gap-4">
          {isLoggedIn ? (
            <>
              <SongRating songId={songId} avgRating={avgRating} ratingCount={ratingCount} />
              <SuggestionForms songId={songId} songTitle={title} songAuthor={author} />
            </>
          ) : (
            <p className="text-sm opacity-70">
              <Link href="/login" className="underline underline-offset-2 font-medium" style={{ color: "var(--brand)" }}>
                Inicia sesión
              </Link>{" "}
              para valorar o sugerir cambios.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
