import { describe, it, expect } from "vitest";
import { renderChordPro, transposedKey } from "./chords";

describe("renderChordPro", () => {
  it("transpone +2 semitonos (C -> D) y conserva la letra", () => {
    const html = renderChordPro("[C]Amazing [F]grace", 2);
    expect(html).toContain("Amazing");
    expect(html).toContain("grace");
    expect(html).toContain("D"); // C+2 = D
    expect(html).toContain("G"); // F+2 = G
  });

  it("transpone solfeo español ([Do] -> [Re])", () => {
    const html = renderChordPro("[Do]Santo [Fa]santo", 2);
    expect(html).toContain("Re"); // Do+2 = Re
    expect(html).toContain("Sol"); // Fa+2 = Sol
    expect(html).toContain("Santo");
  });

  it("sin transposición devuelve los acordes originales", () => {
    const html = renderChordPro("[Do]Gloria", 0);
    expect(html).toContain("Do");
    expect(html).toContain("Gloria");
  });
});

describe("transposedKey", () => {
  it("C +2 = D", () => expect(transposedKey("C", 2)).toBe("D"));
  it("B +1 hace wrap a C", () => expect(transposedKey("B", 1)).toBe("C"));
  it("Do +2 = Re (solfeo)", () => expect(transposedKey("Do", 2)).toBe("Re"));
  it("tonalidad vacía o inválida no rompe", () => {
    expect(transposedKey("", 2)).toBe("");
    expect(transposedKey("???", 2)).toBe("???");
  });
});
