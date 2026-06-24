"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  songId: string;
  songTitle: string;
  songAuthor: string | null;
}

export default function SuggestionForms({ songId, songTitle, songAuthor }: Props) {
  // ── Corrección ──
  const [corrBody, setCorrBody] = useState("");
  const [corrEstado, setCorrEstado] = useState<"idle" | "ok" | "error">("idle");
  const [corrError, setCorrError] = useState("");

  async function enviarCorreccion(e: React.FormEvent) {
    e.preventDefault();
    setCorrEstado("idle");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCorrEstado("error"); setCorrError("No hay sesión activa."); return; }

    const { error } = await supabase.from("corrections").insert({
      song_id: songId,
      user_id: user.id,
      body: corrBody.trim(),
    });

    if (error) { setCorrEstado("error"); setCorrError("Error al enviar la corrección."); return; }
    setCorrEstado("ok");
    setCorrBody("");
  }

  // ── Alternativa ──
  const [altChordpro, setAltChordpro] = useState("");
  const [altKey, setAltKey] = useState("");
  const [altEstado, setAltEstado] = useState<"idle" | "ok" | "error">("idle");
  const [altError, setAltError] = useState("");

  async function enviarAlternativa(e: React.FormEvent) {
    e.preventDefault();
    setAltEstado("idle");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setAltEstado("error"); setAltError("No hay sesión activa."); return; }

    const { error } = await supabase.from("songs").insert({
      title: songTitle,
      author: songAuthor,
      chordpro: altChordpro.trim(),
      original_key: altKey.trim() || null,
      parent_id: songId,
      status: "pending",
      created_by: user.id,
    });

    if (error) { setAltEstado("error"); setAltError("Error al enviar la alternativa."); return; }
    setAltEstado("ok");
    setAltChordpro("");
    setAltKey("");
  }

  const labelCls = "block text-sm font-medium mb-1 opacity-80";
  const inputCls = "w-full rounded-lg border border-current/20 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]";
  const btnCls = "min-h-[44px] px-4 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90 active:opacity-75";

  return (
    <div className="flex flex-col gap-6 mt-4">
      {/* ── Sugerir corrección ── */}
      <section>
        <h3 className="font-semibold mb-2">Sugerir corrección</h3>
        <form onSubmit={enviarCorreccion} className="flex flex-col gap-3">
          <div>
            <label className={labelCls} htmlFor="corr-body">Describe el error o la mejora</label>
            <textarea
              id="corr-body"
              className={inputCls}
              rows={3}
              required
              value={corrBody}
              onChange={(e) => setCorrBody(e.target.value)}
              placeholder="Ej: El acorde del estribillo debería ser Am en vez de A…"
            />
          </div>
          <button
            type="submit"
            className={btnCls}
            style={{ background: "var(--brand)" }}
            disabled={!corrBody.trim()}
          >
            Enviar corrección
          </button>
          {corrEstado === "ok" && <p className="text-sm" style={{ color: "var(--brand)" }}>Corrección enviada, gracias.</p>}
          {corrEstado === "error" && <p className="text-sm text-red-500">{corrError}</p>}
        </form>
      </section>

      {/* ── Subir alternativa ── */}
      <section>
        <h3 className="font-semibold mb-2">Subir versión alternativa</h3>
        <p className="text-sm opacity-60 mb-3">Tu versión quedará pendiente de aprobación.</p>
        <form onSubmit={enviarAlternativa} className="flex flex-col gap-3">
          <div>
            <label className={labelCls} htmlFor="alt-key">Tonalidad (opcional)</label>
            <input
              id="alt-key"
              className={inputCls}
              type="text"
              value={altKey}
              onChange={(e) => setAltKey(e.target.value)}
              placeholder="Ej: G, Am, Bb…"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="alt-chordpro">Letra con acordes (formato ChordPro)</label>
            <textarea
              id="alt-chordpro"
              className={inputCls}
              rows={8}
              required
              value={altChordpro}
              onChange={(e) => setAltChordpro(e.target.value)}
              placeholder={"[G]Santo, [Am]santo, [D]santo…"}
            />
          </div>
          <button
            type="submit"
            className={btnCls}
            style={{ background: "var(--brand)" }}
            disabled={!altChordpro.trim()}
          >
            Enviar alternativa
          </button>
          {altEstado === "ok" && <p className="text-sm" style={{ color: "var(--brand)" }}>Enviado, pendiente de aprobación.</p>}
          {altEstado === "error" && <p className="text-sm text-red-500">{altError}</p>}
        </form>
      </section>
    </div>
  );
}
