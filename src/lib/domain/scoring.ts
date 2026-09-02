export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 6;

/**
 * Sistema de puntuación de Catanero.
 * Ganador: numberOfPlayers / 2. Último: -0.5. Intermedios: 0.
 */
export function calculateRankingPoints(
  position: number,
  numberOfPlayers: number
): number {
  if (
    !Number.isInteger(numberOfPlayers) ||
    numberOfPlayers < MIN_PLAYERS ||
    numberOfPlayers > MAX_PLAYERS
  ) {
    throw new Error(
      `numberOfPlayers debe ser un entero entre ${MIN_PLAYERS} y ${MAX_PLAYERS}, recibido: ${numberOfPlayers}`
    );
  }

  if (!Number.isInteger(position) || position < 1 || position > numberOfPlayers) {
    throw new Error(
      `position (${position}) fuera de rango para una partida de ${numberOfPlayers} jugadores`
    );
  }

  if (position === 1) {
    return numberOfPlayers / 2;
  }

  if (position === numberOfPlayers) {
    return -0.5;
  }

  return 0;
}

/**
 * Las posiciones de una partida deben ser únicas y consecutivas (1..N).
 */
export function validatePositions(positions: number[]): void {
  const n = positions.length;
  const sorted = [...positions].sort((a, b) => a - b);
  const expected = Array.from({ length: n }, (_, i) => i + 1);
  const isValid = sorted.every((value, index) => value === expected[index]);

  if (!isValid) {
    throw new Error(
      "Las posiciones deben ser únicas y consecutivas, del 1 al número de jugadores"
    );
  }
}
