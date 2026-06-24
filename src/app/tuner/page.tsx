"use client";

import { useEffect, useRef, useState } from "react";
import { PitchDetector } from "pitchy";
import { noteFromFrequency, NoteReading } from "@/lib/tuner";

type Estado = "inactivo" | "activo" | "denegado";

export default function AfinadorPage() {
  const [estado, setEstado] = useState<Estado>("inactivo");
  const [lectura, setLectura] = useState<NoteReading | null>(null);

  // Refs para los recursos de audio (no necesitan re-render al cambiar)
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  const detener = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    ctxRef.current?.close();
    rafRef.current = null;
    streamRef.current = null;
    ctxRef.current = null;
    setEstado("inactivo");
    setLectura(null);
  };

  const activar = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new AudioContext();
      ctxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      ctx.createMediaStreamSource(stream).connect(analyser);

      const buf = new Float32Array(analyser.fftSize);
      // ponytail: detector creado una sola vez fuera del bucle
      const detector = PitchDetector.forFloat32Array(analyser.fftSize);

      setEstado("activo");

      const bucle = () => {
        analyser.getFloatTimeDomainData(buf);
        const [hz, clarity] = detector.findPitch(buf, ctx.sampleRate);
        if (clarity > 0.9 && hz >= 50 && hz <= 1100) {
          setLectura(noteFromFrequency(hz));
        }
        rafRef.current = requestAnimationFrame(bucle);
      };
      rafRef.current = requestAnimationFrame(bucle);
    } catch {
      setEstado("denegado");
    }
  };

  // Limpieza al desmontar
  useEffect(() => detener, []);

  const afinado = lectura && Math.abs(lectura.cents) < 5;
  const colorAguja = afinado ? "bg-green-500" : "bg-amber-400";
  const colorNota = afinado ? "text-green-500" : "text-amber-400";
  // Aguja: 0 cents → centro (50%); ±50 cents → extremos (0%..100%)
  const posAguja = lectura ? Math.min(100, Math.max(0, 50 + lectura.cents)) : 50;

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-10">
      <h1 className="text-2xl font-bold" style={{ color: "var(--brand)" }}>
        Afinador
      </h1>

      {/* Nota detectada */}
      <div className="flex flex-col items-center gap-1 min-h-[120px] justify-center">
        {lectura ? (
          <>
            <span className={`text-7xl font-extrabold leading-none transition-colors ${colorNota}`}>
              {lectura.name}{lectura.octave}
            </span>
            <span className="text-sm text-neutral-500 mt-1">
              {lectura.frequency.toFixed(1)} Hz
            </span>
            <span className="text-xs text-neutral-400">
              {lectura.cents > 0 ? "+" : ""}{lectura.cents} cents
            </span>
          </>
        ) : (
          <span className="text-neutral-400 text-lg">
            {estado === "activo" ? "Escuchando…" : "—"}
          </span>
        )}
      </div>

      {/* Indicador de cents */}
      <div className="w-full max-w-xs">
        {/* Escala */}
        <div className="flex justify-between text-xs text-neutral-400 mb-1 px-1">
          <span>-50</span>
          <span>0</span>
          <span>+50</span>
        </div>
        {/* Barra con aguja */}
        <div className="relative h-5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
          {/* Zona verde central */}
          <div className="absolute inset-y-0 left-[45%] w-[10%] bg-green-200 dark:bg-green-900" />
          {/* Línea central */}
          <div className="absolute inset-y-0 left-1/2 w-px bg-neutral-400" />
          {/* Aguja */}
          {lectura && (
            <div
              className={`absolute top-1 bottom-1 w-2 rounded-full ${colorAguja} transition-all`}
              style={{ left: `calc(${posAguja}% - 4px)` }}
            />
          )}
        </div>
        <div className="flex justify-center mt-1">
          {afinado && (
            <span className="text-xs font-semibold text-green-500">✓ Afinado</span>
          )}
        </div>
      </div>

      {/* Botones (≥44px táctil) */}
      {estado === "inactivo" && (
        <button
          onClick={activar}
          className="min-h-[48px] px-8 rounded-xl font-semibold text-white text-base"
          style={{ backgroundColor: "var(--brand)" }}
        >
          Activar micrófono
        </button>
      )}
      {estado === "activo" && (
        <button
          onClick={detener}
          className="min-h-[48px] px-8 rounded-xl font-semibold text-base bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
        >
          Detener
        </button>
      )}
      {estado === "denegado" && (
        <p className="text-red-500 text-sm text-center max-w-xs">
          Permiso de micrófono denegado. Actívalo en los ajustes del navegador e inténtalo de nuevo.
        </p>
      )}
    </div>
  );
}
