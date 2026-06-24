// Tipos espejo de las tablas de Supabase (ver supabase/migrations/0001_init.sql).

export type Role = "user" | "admin";
export type SongStatus = "published" | "pending";
export type SongAccess = "public" | "members";

export interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  role: Role;
  created_at: string;
}

export interface Song {
  id: string;
  title: string;
  author: string | null;
  themes: string[];
  chordpro: string;
  original_key: string | null;
  pdf_path: string | null;
  status: SongStatus;
  access: SongAccess;
  parent_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Correction {
  id: string;
  song_id: string;
  user_id: string;
  body: string;
  status: "open" | "resolved";
  created_at: string;
}

export type EventType = "boda" | "bautizo" | "comunion" | "funeral" | "otro";

export interface Setlist {
  id: string;
  title: string;
  event_type: EventType | null;
  notes: string | null;
  share_token: string;
  created_by: string;
  created_at: string;
}

/** Una canción dentro de una lista, con su orden y tono marcado. */
export interface SetlistSong {
  setlist_id: string;
  song_id: string;
  position: number;
  semitones: number;
}

/** Forma que devuelve la función SQL get_shared_setlist (vista pública). */
export interface SharedSetlist {
  id: string;
  title: string;
  event_type: EventType | null;
  notes: string | null;
  songs: {
    song_id: string;
    title: string;
    author: string | null;
    original_key: string | null;
    access: SongAccess;
    position: number;
    semitones: number;
    chordpro: string | null; // null si no se puede mostrar (copyright + sin sesión)
  }[];
}
