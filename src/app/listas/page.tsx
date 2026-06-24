import Link from "next/link";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createSetlist } from "./actions";
import type { Setlist, EventType } from "@/lib/types";

const EVENT_LABELS: Record<EventType, string> = {
  boda: "Boda",
  bautizo: "Bautizo",
  comunion: "Comunión",
  funeral: "Funeral",
  otro: "Otro",
};

export default async function ListasPage() {
  const user = await getUser();

  if (!user) {
    return (
      <main className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 mb-4">Inicia sesión para crear listas de canciones.</p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Iniciar sesión
        </Link>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: setlists } = await supabase
    .from("setlists")
    .select("id, title, event_type, created_at")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false })
    .returns<Pick<Setlist, "id" | "title" | "event_type" | "created_at">[]>();

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 space-y-10">
      <h1 className="text-2xl font-bold text-indigo-700">Mis listas</h1>

      {/* Lista de setlists */}
      {setlists && setlists.length > 0 ? (
        <ul className="space-y-3">
          {setlists.map((sl) => (
            <li key={sl.id}>
              <Link
                href={`/listas/${sl.id}`}
                className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-4 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
              >
                <span className="font-medium text-gray-900">{sl.title}</span>
                {sl.event_type && (
                  <span className="text-xs rounded-full bg-indigo-100 text-indigo-700 px-2 py-1">
                    {EVENT_LABELS[sl.event_type]}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">
          Todavía no tienes listas. Crea la primera a continuación.
        </p>
      )}

      {/* Formulario nueva lista */}
      <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-indigo-800">Nueva lista</h2>
        <form action={createSetlist} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="p.ej. Boda de Ana y Carlos"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="event_type" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de evento
            </label>
            <select
              id="event_type"
              name="event_type"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">— Selecciona —</option>
              <option value="boda">Boda</option>
              <option value="bautizo">Bautizo</option>
              <option value="comunion">Comunión</option>
              <option value="funeral">Funeral</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Observaciones, hora, lugar…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Crear
          </button>
        </form>
      </section>
    </main>
  );
}
