"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";

interface Props {
  defaultValue?: string;
}

export default function SearchBar({ defaultValue = "" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value.trim();

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        // Conserva el filtro de tema si ya está activo
        const params = new URLSearchParams(searchParams.toString());
        if (q) {
          params.set("q", q);
        } else {
          params.delete("q");
        }
        router.push(`/?${params.toString()}`);
      }, 300);
    },
    [router, searchParams],
  );

  return (
    <div className="relative w-full">
      <label htmlFor="buscar-cancion" className="sr-only">
        Buscar canción
      </label>
      {/* Icono lupa */}
      <span
        className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12.9 14.32a8 8 0 111.41-1.41l4.3 4.29a1 1 0 01-1.42 1.42l-4.29-4.3zM8 14A6 6 0 108 2a6 6 0 000 12z"
            clipRule="evenodd"
          />
        </svg>
      </span>
      <input
        id="buscar-cancion"
        type="search"
        defaultValue={defaultValue}
        onChange={handleChange}
        placeholder="Buscar por título o autor…"
        autoComplete="off"
        className="w-full rounded-xl border border-zinc-300 bg-white py-3 pl-10 pr-4 text-base shadow-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 dark:border-zinc-600 dark:bg-zinc-900"
      />
    </div>
  );
}
