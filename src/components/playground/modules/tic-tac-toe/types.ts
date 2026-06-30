/**
 * Tic Tac Toe Module — Core Types
 */

export type Player = 'X' | 'O'

export type Cell = Player | null

/** Board as a 9-element tuple, index 0–8 (row-major order) */
export type Board = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell]

export type GameMode = 'pvp' | 'pvc'

export type BotLevel = 'easy' | 'medium' | 'hard'

/** idle = no moves yet, playing = in progress, won = someone won, draw = board full no winner */
export type GameStatus = 'idle' | 'playing' | 'won' | 'draw'

/** All winning line index combinations */
export const WIN_LINES: readonly [number, number, number][] = [
  [0, 1, 2], // top row
  [3, 4, 5], // mid row
  [6, 7, 8], // bot row
  [0, 3, 6], // left col
  [1, 4, 7], // mid col
  [2, 5, 8], // right col
  [0, 4, 8], // diagonal \
  [2, 4, 6], // diagonal /
] as const

export interface GameState {
  board: Board
  currentPlayer: Player
  status: GameStatus
  winner: Player | null
  /** Indices of the winning 3 cells (for highlight) */
  winLine: [number, number, number] | null
  gameMode: GameMode
  botLevel: BotLevel
  /** Number of moves made (to determine "in progress") */
  moveCount: number
}
