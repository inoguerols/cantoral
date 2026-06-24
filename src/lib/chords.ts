import { Key, ChordProParser, HtmlDivFormatter } from "chordsheetjs";

// Wrappers finos sobre chordsheetjs. Soporta cifrado anglosajón (C, D, G7) y
// solfeo español ([Do], [Re], [Sol7]) de forma nativa: la salida conserva la
// notación de entrada. No reimplementamos parser ni transpositor de acordes.
// Import con nombre (no default): bajo ESM el export default no expone `Key`.

const parser = new ChordProParser();
const formatter = new HtmlDivFormatter();

/** Parsea ChordPro, transpone `semitones` (puede ser negativo) y devuelve HTML. */
export function renderChordPro(chordpro: string, semitones = 0): string {
  const song = parser.parse(chordpro);
  const out = semitones === 0 ? song : song.transpose(semitones);
  return formatter.format(out);
}

/**
 * Tonalidad resultante tras transponer `semitones` desde `originalKey`.
 * Si la tonalidad no se reconoce, devuelve la original sin romper.
 */
export function transposedKey(originalKey: string, semitones: number): string {
  if (!originalKey) return "";
  try {
    return Key.parseOrFail(originalKey).transpose(semitones).toString();
  } catch {
    return originalKey;
  }
}
