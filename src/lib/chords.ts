import { Key, ChordProParser, HtmlDivFormatter } from "chordsheetjs";

// Wrappers finos sobre chordsheetjs. Soporta cifrado anglosajón (C, D, G7) y
// solfeo español ([Do], [Re], [Sol7]) de forma nativa.
// Import con nombre (no default): bajo ESM el export default no expone `Key`.

const parser = new ChordProParser();
const formatter = new HtmlDivFormatter();

export type Notation = "solfege" | "english";

const ENG_OUT = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const SOLF_OUT = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"];

// Nombre de nota (con accidental) -> semitono (0-11). Cubre anglosajón y solfeo.
const SEMITONE: Record<string, number> = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11,
  Do: 0, "Do#": 1, Reb: 1, Re: 2, "Re#": 3, Mib: 3, Mi: 4, Fa: 5, "Fa#": 6, Solb: 6, Sol: 7, "Sol#": 8, Lab: 8, La: 9, "La#": 10, Sib: 10, Si: 11,
};

// Convierte un acorde (incluido bajo tras "/") al sistema de notación destino.
function convChord(token: string, out: string[]): string {
  return token
    .split("/")
    .map((part) => {
      const m = part.match(/^(Sol|Do|Re|Mi|Fa|La|Si|[A-G])([#b]?)(.*)$/);
      if (!m) return part;
      const semi = SEMITONE[m[1] + m[2]];
      if (semi === undefined) return part;
      return out[semi] + m[3];
    })
    .join("/");
}

/** Reescribe TODOS los acordes de un ChordPro al sistema indicado (Sol/G). */
export function convertNotation(chordpro: string, target: Notation): string {
  const out = target === "solfege" ? SOLF_OUT : ENG_OUT;
  return chordpro
    .replace(/\[([^\]\n]+)\]/g, (_, c) => "[" + convChord(c.trim(), out) + "]")
    .replace(/\{(key|capo):\s*([^}]+)\}/gi, (_full, tag, val) => `{${tag}: ${convChord(val.trim(), out)}}`);
}

/** Parsea ChordPro, opcionalmente cambia la notación, transpone y devuelve HTML. */
export function renderChordPro(chordpro: string, semitones = 0, notation?: Notation): string {
  const cp = notation ? convertNotation(chordpro, notation) : chordpro;
  const song = parser.parse(cp);
  const out = semitones === 0 ? song : song.transpose(semitones);
  return formatter.format(out);
}

/**
 * Tonalidad resultante tras transponer `semitones`, en la notación indicada.
 * Si la tonalidad no se reconoce, devuelve la original sin romper.
 */
export function transposedKey(originalKey: string, semitones: number, notation?: Notation): string {
  if (!originalKey) return "";
  try {
    const k = Key.parseOrFail(originalKey).transpose(semitones).toString();
    return notation ? convChord(k, notation === "solfege" ? SOLF_OUT : ENG_OUT) : k;
  } catch {
    return originalKey;
  }
}
