"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError("");

    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + "/auth/callback",
      },
    });

    setCargando(false);
    if (err) {
      setError("No se pudo enviar el enlace. Inténtalo de nuevo.");
    } else {
      setEnviado(true);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold" style={{ color: "var(--brand)" }}>
            Acceder a Cantoral
          </h1>
          <p className="text-sm text-gray-500">
            Te enviamos un enlace mágico a tu correo
          </p>
        </div>

        {enviado ? (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-center space-y-3">
            <p className="text-indigo-800 font-medium">
              Te hemos enviado un enlace de acceso a tu correo
            </p>
            <p className="text-sm text-indigo-600">
              Revisa tu bandeja de entrada (y la carpeta de spam).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full rounded-lg px-4 py-3 text-base font-medium text-white disabled:opacity-60"
              style={{ backgroundColor: "var(--brand)", minHeight: "44px" }}
            >
              {cargando ? "Enviando…" : "Enviar enlace"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500">
          <Link href="/" className="underline hover:text-gray-700">
            Volver al inicio
          </Link>
        </p>
      </div>
    </main>
  );
}
