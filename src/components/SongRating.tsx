"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  songId: string;
  avgRating: number;
  ratingCount: number;
}

export default function SongRating({ songId, avgRating, ratingCount }: Props) {
  const [selected, setSelected] = useState(0);
  const [hover, setHover] = useState(0);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function votar(stars: number) {
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Inicia sesión para valorar."); return; }

    const { error: err } = await supabase
      .from("ratings")
      .upsert({ user_id: user.id, song_id: songId, stars }, { onConflict: "user_id,song_id" });

    if (err) { setError("Error al guardar la valoración."); return; }
    setSelected(stars);
    setEnviado(true);
  }

  const display = hover || selected;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onClick={() => votar(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${s} estrella${s > 1 ? "s" : ""}`}
            className="text-2xl leading-none min-w-[44px] min-h-[44px] flex items-center justify-center transition-transform active:scale-110"
            style={{ color: s <= display ? "var(--brand)" : "currentColor", opacity: s <= display ? 1 : 0.3 }}
          >
            ★
          </button>
        ))}
        <span className="text-sm opacity-60 ml-1">
          {ratingCount > 0 ? `${avgRating.toFixed(1)} (${ratingCount})` : "Sin valoraciones"}
        </span>
      </div>
      {enviado && <p className="text-sm" style={{ color: "var(--brand)" }}>¡Valoración guardada!</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
