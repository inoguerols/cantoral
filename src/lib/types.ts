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
