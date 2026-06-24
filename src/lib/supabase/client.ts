"use client";

import { createBrowserClient } from "@supabase/ssr";

// Cliente Supabase para el navegador. Usa solo claves públicas (anon).
// La seguridad la imponen las RLS policies, no el secreto de la clave.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
