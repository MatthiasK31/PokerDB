export interface Player {
  id: string;
  name: string;
  totalBuyIns: number;
  totalCashOuts: number;
  netProfits: number;
  gamesPlayed: number;
}

export interface Group {
  id: string;
  name: string;
  playerIds: string[];
}

export interface GamePlayer {
  playerId: string;
  name: string;
  buyIn: number; // sum of all buy-ins for this seat
  cashOut: number | null;
  isActive: boolean;
}

export interface Game {
  id: string;
  date: string; // ISO string for persistence
  isActive: boolean;
  endedAt?: string; // ISO when game finished
  players: GamePlayer[];
}
