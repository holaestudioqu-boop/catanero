import { calculateRankingPoints } from "./scoring";
import type { Game, Player, PlayerStats } from "./types";

interface Accumulator {
  gamesPlayed: number;
  wins: number;
  lastPlaceCount: number;
  rankingPointsTotal: number;
  positionSum: number;
  catanPointsSum: number;
  catanPointsCount: number;
}

function emptyAccumulator(): Accumulator {
  return {
    gamesPlayed: 0,
    wins: 0,
    lastPlaceCount: 0,
    rankingPointsTotal: 0,
    positionSum: 0,
    catanPointsSum: 0,
    catanPointsCount: 0,
  };
}

/** Evita arrastre de errores de punto flotante en sumas de múltiplos de 0.5. */
function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

/**
 * Deriva las estadísticas y el ranking a partir de las partidas (games) y
 * sus resultados. Las partidas son la única fuente de verdad: no existe un
 * campo "total_points" editable en ningún jugador.
 */
export function buildPlayerStats(players: Player[], games: Game[]): PlayerStats[] {
  const accumulators = new Map<string, Accumulator>();
  for (const player of players) {
    accumulators.set(player.id, emptyAccumulator());
  }

  for (const game of games) {
    const numberOfPlayers = game.results.length;
    for (const result of game.results) {
      const acc = accumulators.get(result.playerId);
      if (!acc) continue;

      acc.gamesPlayed += 1;
      acc.positionSum += result.position;
      acc.rankingPointsTotal += calculateRankingPoints(result.position, numberOfPlayers);

      if (result.position === 1) acc.wins += 1;
      if (result.position === numberOfPlayers) acc.lastPlaceCount += 1;

      if (result.catanPoints != null) {
        acc.catanPointsSum += result.catanPoints;
        acc.catanPointsCount += 1;
      }
    }
  }

  const stats: PlayerStats[] = players.map((player) => {
    const acc = accumulators.get(player.id) ?? emptyAccumulator();
    return {
      playerId: player.id,
      displayName: player.displayName,
      rankingPoints: roundToHalf(acc.rankingPointsTotal),
      gamesPlayed: acc.gamesPlayed,
      wins: acc.wins,
      winRate: acc.gamesPlayed > 0 ? acc.wins / acc.gamesPlayed : 0,
      lastPlaceCount: acc.lastPlaceCount,
      averagePosition: acc.gamesPlayed > 0 ? acc.positionSum / acc.gamesPlayed : 0,
      averageCatanPoints:
        acc.catanPointsCount > 0 ? acc.catanPointsSum / acc.catanPointsCount : null,
    };
  });

  return sortRanking(stats);
}

/**
 * Orden de desempate: 1) puntos Catanero, 2) victorias,
 * 3) mejor (menor) promedio de posición, 4) mayor promedio de puntos CATAN
 * cuando ambos jugadores tengan datos suficientes.
 */
export function sortRanking(stats: PlayerStats[]): PlayerStats[] {
  return [...stats].sort((a, b) => {
    if (b.rankingPoints !== a.rankingPoints) return b.rankingPoints - a.rankingPoints;
    if (b.wins !== a.wins) return b.wins - a.wins;

    if (a.gamesPlayed === 0 && b.gamesPlayed === 0) return 0;
    if (a.gamesPlayed === 0) return 1;
    if (b.gamesPlayed === 0) return -1;

    if (a.averagePosition !== b.averagePosition) return a.averagePosition - b.averagePosition;

    if (a.averageCatanPoints != null && b.averageCatanPoints != null) {
      if (a.averageCatanPoints !== b.averageCatanPoints) {
        return b.averageCatanPoints - a.averageCatanPoints;
      }
    }

    return 0;
  });
}
