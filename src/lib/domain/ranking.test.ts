import { describe, expect, it } from "vitest";
import { buildLastPlacePodium, buildPlayerStats } from "./ranking";
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

describe("buildLastPlacePodium", () => {
  const game = (id: string, order: string[]): Game => ({
    id,
    playedAt: "2026-01-01",
    results: order.map((playerId, i) => ({ playerId, position: i + 1 })),
  });

  it("ordena por cantidad de veces que salieron últimos y deja afuera a quien nunca lo fue", () => {
    const games = [
      game("g1", ["pedro", "willy", "juan", "guille"]),
      game("g2", ["pedro", "juan", "willy", "guille"]),
      game("g3", ["pedro", "guille", "willy", "juan"]),
      game("g4", ["willy", "pedro", "guille", "juan"]),
    ];

    const podium = buildLastPlacePodium(buildPlayerStats(players, games));

    expect(podium.map((s) => s.playerId)).toEqual(["guille", "juan"]);
    expect(podium.map((s) => s.lastPlaceCount)).toEqual([2, 2]);
  });

  it("desempata por proporción de últimos sobre partidas jugadas y luego por nombre", () => {
    const games = [
      game("g1", ["pedro", "guille", "willy", "juan"]),
      game("g2", ["pedro", "guille", "juan", "willy"]),
      game("g3", ["willy", "guille", "pedro"]),
    ];

    // juan: último 1 de 2 partidas. willy: 1 de 3. pedro: 1 de 3.
    // willy y pedro empatan en proporción, así que desempata el nombre.
    const podium = buildLastPlacePodium(buildPlayerStats(players, games));

    expect(podium.map((s) => s.playerId)).toEqual(["juan", "pedro", "willy"]);
  });

  it("limita el podio a 3 y no modifica el arreglo recibido", () => {
    const games = [
      game("g1", ["pedro", "willy", "juan", "guille"]),
      game("g2", ["guille", "pedro", "willy", "juan"]),
      game("g3", ["juan", "guille", "pedro", "willy"]),
      game("g4", ["willy", "juan", "guille", "pedro"]),
    ];

    const stats = buildPlayerStats(players, games);
    const snapshot = stats.map((s) => s.playerId);
    const podium = buildLastPlacePodium(stats);

    expect(podium).toHaveLength(3);
    expect(stats.map((s) => s.playerId)).toEqual(snapshot);
  });

  it("devuelve vacío si todavía nadie salió último", () => {
    expect(buildLastPlacePodium(buildPlayerStats(players, []))).toEqual([]);
  });
});
