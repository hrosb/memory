/**
 * Core game type definitions used across components
 */

export interface CardItem {
  name: string;
  revealed: boolean;
  matched?: boolean;
}

export interface GameState {
  cardType: string;
  boardSizeId: string;
  cards: CardItem[];
  elapsedTime: number | string;
  gameStartTime: number | null;
  hits: number;
  misses: number;
  gameCompleted: boolean;
  currentGame: {
    uuid: string;
    playerName: string;
    started: boolean;
  };
  clickedCards: number[];
}

export interface GameOptions {
  cardType: string;
  boardSizeId: string;
  playerName?: string;
  musicOn?: boolean;
  gfxOn?: boolean;
}

export interface Score {
  id?: string;
  playerName: string;
  timeSpent: number;
  accuracy: number;
  boardSize: string;
  cardType: string;
  createdAt?: string;
  uuid?: string;
}

export interface Pagination {
  page: number;
  pages: number;
  total?: number;
}

export interface BoardSizeOption {
  id: string;
  rows: number;
  columns: number;
  name: string;
  name_nb: string;
}

export interface CardType {
  type: string;
  name: string;
  name_nb: string;
  cards: string[];
}

export interface AudioSettings {
  gfx: boolean;
  music: boolean;
}
