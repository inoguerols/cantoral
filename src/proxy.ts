import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next 16 renombró el convenio "middleware" a "proxy".
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Excluye estáticos e imágenes; corre en el resto para refrescar sesión.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
