// Mapeo frecuencia -> nota. Nombres en solfeo (Do Re Mi) para coherencia con el
// cifrado español de las canciones. La captación de tono (pitchy + Web Audio) vive
// en el componente; aquí solo la conversión pura, fácil de testear.

const NOTES = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"];

export interface NoteReading {
  name: string; // p.ej. "La"
  octave: number; // p.ej. 4
  cents: number; // desviación respecto a la nota exacta (-50..+50 aprox)
  frequency: number; // la frecuencia de entrada
}

/** Convierte una frecuencia (Hz) en la nota más cercana + desviación en cents. */
export function noteFromFrequency(frequency: number, a4 = 440): NoteReading {
  // MIDI: A4 (La4) = 69. noteNum = 12*log2(f/440) + 69
  const noteNum = 12 * Math.log2(frequency / a4) + 69;
  const rounded = Math.round(noteNum);
  const name = NOTES[((rounded % 12) + 12) % 12];
  const octave = Math.floor(rounded / 12) - 1;
  const targetFreq = a4 * Math.pow(2, (rounded - 69) / 12);
  const cents = Math.round(1200 * Math.log2(frequency / targetFreq));
  return { name, octave, cents, frequency };
}
