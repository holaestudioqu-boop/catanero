import { describe, expect, it } from "vitest";
import { calculateRankingPoints, validatePositions } from "./scoring";

describe("calculateRankingPoints", () => {
  it("partida de 3 jugadores: ganador +1.5, segundo 0, último -0.5", () => {
    expect(calculateRankingPoints(1, 3)).toBe(1.5);
    expect(calculateRankingPoints(2, 3)).toBe(0);
    expect(calculateRankingPoints(3, 3)).toBe(-0.5);
  });

  it("partida de 4 jugadores: ganador +2, intermedios 0, último -0.5", () => {
    expect(calculateRankingPoints(1, 4)).toBe(2);
    expect(calculateRankingPoints(2, 4)).toBe(0);
    expect(calculateRankingPoints(3, 4)).toBe(0);
    expect(calculateRankingPoints(4, 4)).toBe(-0.5);
  });

  it("partida de 5 jugadores: ganador +2.5, intermedios 0, último -0.5", () => {
    expect(calculateRankingPoints(1, 5)).toBe(2.5);
    expect(calculateRankingPoints(2, 5)).toBe(0);
    expect(calculateRankingPoints(3, 5)).toBe(0);
    expect(calculateRankingPoints(4, 5)).toBe(0);
    expect(calculateRankingPoints(5, 5)).toBe(-0.5);
  });

  it("partida de 6 jugadores: ganador +3, intermedios 0, último -0.5", () => {
    expect(calculateRankingPoints(1, 6)).toBe(3);
    expect(calculateRankingPoints(2, 6)).toBe(0);
    expect(calculateRankingPoints(5, 6)).toBe(0);
    expect(calculateRankingPoints(6, 6)).toBe(-0.5);
  });

  it("rechaza cantidad de jugadores fuera de rango (2 y 7)", () => {
    expect(() => calculateRankingPoints(1, 2)).toThrow();
    expect(() => calculateRankingPoints(1, 7)).toThrow();
  });

  it("rechaza posiciones inválidas (0, negativas o mayores al número de jugadores)", () => {
    expect(() => calculateRankingPoints(0, 4)).toThrow();
    expect(() => calculateRankingPoints(-1, 4)).toThrow();
    expect(() => calculateRankingPoints(5, 4)).toThrow();
  });
});

describe("validatePositions", () => {
  it("acepta posiciones únicas y consecutivas", () => {
    expect(() => validatePositions([1, 2, 3, 4])).not.toThrow();
    expect(() => validatePositions([3, 1, 2])).not.toThrow();
  });

  it("rechaza posiciones duplicadas", () => {
    expect(() => validatePositions([1, 2, 2, 4])).toThrow();
  });

  it("rechaza posiciones no consecutivas o fuera de rango", () => {
    expect(() => validatePositions([1, 2, 3, 5])).toThrow();
    expect(() => validatePositions([0, 1, 2, 3])).toThrow();
  });
});
