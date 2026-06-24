"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { renderChordPro } from "@/lib/chords";
import { createOrUpdateSong } from "@/app/admin/actions";
import type { Song } from "@/lib/types";

interface Props {
  /** Si se pasa, el formulario edita la canción; si no, crea una nueva. */
  song?: Song;
  onDone?: () => void;
}

export default function SongEditor({ song, onDone }: Props) {
  const [chordpro, setChordpro] = useState(song?.chordpro ?? "");
  const [pdfPath, setPdfPath] = useState(song?.pdf_path ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handlePdfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const supabase = createClient();
      // Nombre único: timestamp + nombre original
      const path = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
      const { error } = await supabase.storage.from("songs-pdfs").upload(path, file);
      if (error) throw error;
      setPdfPath(path);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Error subiendo PDF");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");
    const fd = new FormData(e.currentTarget);
    // pdf_path viene del estado (puede haberse subido justo antes)
    fd.set("pdf_path", pdfPath);
    startTransition(async () => {
      try {
        await createOrUpdateSong(fd);
        onDone?.();
      } catch (err: unknown) {
        setServerError(err instanceof Error ? err.message : "Error al guardar");
      }
    });
  }

  const previewHtml = chordpro.trim() ? renderChordPro(chordpro) : "";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ── Formulario ── */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {song?.id && <input type="hidden" name="id" value={song.id} />}
        <input type="hidden" name="pdf_path" value={pdfPath} />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="se-title">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            id="se-title"
            name="title"
            required
            defaultValue={song?.title}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="se-author">
            Autor
          </label>
          <input
            id="se-author"
            name="author"
            defaultValue={song?.author ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="se-themes">
            Temas <span className="text-zinc-400">(separados por coma)</span>
          </label>
          <input
            id="se-themes"
            name="themes"
            defaultValue={song?.themes?.join(", ") ?? ""}
            placeholder="Adviento, Navidad, Misa"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="se-key">
            Tonalidad original
          </label>
          <input
            id="se-key"
            name="original_key"
            defaultValue={song?.original_key ?? ""}
            placeholder="G, Am, F…"
            className="w-32 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="se-access">
            Acceso
          </label>
          <select
            id="se-access"
            name="access"
            defaultValue={song?.access ?? "members"}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand dark:border-zinc-600 dark:bg-zinc-800"
          >
            <option value="members">Solo miembros (por defecto — repertorio con copyright)</option>
            <option value="public">Pública (dominio público o con licencia)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="se-chordpro">
            ChordPro <span className="text-red-500">*</span>
          </label>
          <textarea
            id="se-chordpro"
            name="chordpro"
            required
            rows={12}
            value={chordpro}
            onChange={(e) => setChordpro(e.target.value)}
            placeholder={
              "{title: Nombre de la canción}\n{key: G}\n\n[G]Gloria a [Em]Dios en el [C]cielo\n[D]y en la [G]tierra paz"
            }
            className="rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">PDF <span className="text-zinc-400">(opcional)</span></label>
          {pdfPath && (
            <p className="text-xs text-zinc-500 truncate">
              Subido: {pdfPath}
            </p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            onChange={handlePdfChange}
            className="text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-zinc-200 dark:file:bg-zinc-700 dark:file:text-zinc-200"
          />
          {uploading && <p className="text-xs text-zinc-400">Subiendo PDF…</p>}
          {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
        </div>

        {/* Estado: solo visible al editar (nueva canción siempre published) */}
        {song && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="se-status">Estado</label>
            <select
              id="se-status"
              name="status"
              defaultValue={song.status}
              className="w-40 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand dark:border-zinc-600 dark:bg-zinc-800"
            >
              <option value="published">Publicada</option>
              <option value="pending">Pendiente</option>
            </select>
          </div>
        )}
        {!song && <input type="hidden" name="status" value="published" />}

        {serverError && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || uploading}
          className="min-h-[44px] rounded-lg px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: "var(--brand)" }}
        >
          {pending ? "Guardando…" : song ? "Guardar cambios" : "Crear canción"}
        </button>
      </form>

      {/* ── Vista previa en vivo ── */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-zinc-500">Vista previa</p>
        {previewHtml ? (
          <div
            className="chord-sheet rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-zinc-300 p-8 text-sm text-zinc-400 dark:border-zinc-700">
            Escribe ChordPro para ver la vista previa
          </div>
        )}
      </div>
    </div>
  );
}
