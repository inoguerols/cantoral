import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente Supabase del lado servidor (server components y server actions).
// Lee/escribe las cookies de sesión. En Next 16 cookies() es asíncrono.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Llamado desde un Server Component: ignorable si hay middleware
            // que refresca la sesión.
          }
        },
      },
    },
  );
}
