import { describe, expect, it } from "vitest";
import { buildPlayerStats } from "./ranking";
import type { Game, Player } from "./types";

const players: Player[] = [
  { id: "pedro", displayName: "Pedro" },
  { id: "willy", displayName: "Willy" },
  { id: "juan", displayName: "Juan" },
  { id: "guille", displayName: "Guille" },
];

describe("buildPlayerStats", () => {
  it("deriva puntos, victorias y promedio de posición desde las partidas", () => {
    const games: Game[] = [
      {
        id: "g1",
        playedAt: "2026-01-01",
        results: [
          { playerId: "pedro", position: 1, catanPoints: 10 },
          { playerId: "willy", position: 2, catanPoints: 8 },
          { playerId: "juan", position: 3, catanPoints: 6 },
          { playerId: "guille", position: 4, catanPoints: 5 },
        ],
      },
      {
        id: "g2",
        playedAt: "2026-01-08",
        results: [
          { playerId: "willy", position: 1 },
          { playerId: "pedro", position: 2 },
          { playerId: "guille", position: 3 },
        ],
      },
    ];

    const stats = buildPlayerStats(players, games);
    const pedro = stats.find((s) => s.playerId === "pedro")!;
    const willy = stats.find((s) => s.playerId === "willy")!;
    const juan = stats.find((s) => s.playerId === "juan")!;

    expect(pedro.gamesPlayed).toBe(2);
    expect(pedro.wins).toBe(1);
    expect(pedro.rankingPoints).toBe(2); // +2 (g1) + 0 (g2)
    expect(pedro.averagePosition).toBe(1.5);
    expect(pedro.averageCatanPoints).toBe(10);

    expect(willy.rankingPoints).toBe(1.5); // 0 (g1) + 1.5 (g2)
    expect(juan.gamesPlayed).toBe(1);
    expect(juan.averageCatanPoints).toBe(6);
  });

  it("un jugador sin partidas no rompe el cálculo y queda al final", () => {
    const stats = buildPlayerStats(players, []);
    expect(stats).toHaveLength(4);
    expect(stats.every((s) => s.gamesPlayed === 0)).toBe(true);
    expect(stats.every((s) => s.averageCatanPoints === null)).toBe(true);
  });

  it("ordena por puntos Catanero y desempata por victorias", () => {
    const games: Game[] = [
      {
        id: "g1",
        playedAt: "2026-01-01",
        results: [
          { playerId: "pedro", position: 1 },
          { playerId: "willy", position: 2 },
          { playerId: "juan", position: 3 },
        ],
      },
    ];
    const stats = buildPlayerStats(players, games);
    expect(stats[0].playerId).toBe("pedro");
  });
});
