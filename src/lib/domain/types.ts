export interface Player {
  id: string;
  displayName: string;
}

export interface GameResult {
  playerId: string;
  position: number;
  catanPoints?: number;
}

export interface Game {
  id: string;
  playedAt: string;
  results: GameResult[];
  notes?: string;
}

export interface PlayerStats {
  playerId: string;
  displayName: string;
  rankingPoints: number;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  lastPlaceCount: number;
  averagePosition: number;
  averageCatanPoints: number | null;
}
