import { describe, it, expect } from "vitest";
import { noteFromFrequency } from "./tuner";

describe("noteFromFrequency", () => {
  it("440 Hz = La4 con 0 cents", () => {
    const r = noteFromFrequency(440);
    expect(r.name).toBe("La");
    expect(r.octave).toBe(4);
    expect(Math.abs(r.cents)).toBeLessThanOrEqual(1);
  });

  it("466.16 Hz = La#4", () => {
    const r = noteFromFrequency(466.16);
    expect(r.name).toBe("La#");
    expect(r.octave).toBe(4);
    expect(Math.abs(r.cents)).toBeLessThanOrEqual(2);
  });

  it("261.63 Hz = Do4", () => {
    const r = noteFromFrequency(261.63);
    expect(r.name).toBe("Do");
    expect(r.octave).toBe(4);
  });

  it("una nota ligeramente desafinada da cents distintos de 0", () => {
    const r = noteFromFrequency(445); // por encima de La4
    expect(r.name).toBe("La");
    expect(r.cents).toBeGreaterThan(0);
  });
});
