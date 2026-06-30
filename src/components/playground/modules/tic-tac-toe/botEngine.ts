/**
 * Tic Tac Toe — Bot Engine
 *
 * Three difficulty levels:
 *   easy   — picks a random empty cell
 *   medium — wins if possible, blocks if necessary, otherwise random
 *   hard   — Minimax (unbeatable, always draws or wins)
 */

import type { Board, Cell, Player, BotLevel } from './types'
import { WIN_LINES } from './types'

// ─── Helpers ─────────────────────────────────────────────────────────

function emptyIndices(board: Board): number[] {
  return board.reduce<number[]>((acc, cell, i) => {
    if (cell === null) acc.push(i)
    return acc
  }, [])
}

function checkWinner(board: Board): Player | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as Player
    }
  }
  return null
}

function applyMove(board: Board, index: number, player: Player): Board {
  const next = [...board] as Board
  next[index] = player
  return next
}

// ─── Easy — pure random ───────────────────────────────────────────────

function easyMove(board: Board): number {
  const empties = emptyIndices(board)
  return empties[Math.floor(Math.random() * empties.length)]
}

// ─── Medium — win > block > random ───────────────────────────────────

function findWinningMove(board: Board, player: Player): number | null {
  for (const [a, b, c] of WIN_LINES) {
    const cells = [board[a], board[b], board[c]]
    const indices = [a, b, c]
    const playerCount = cells.filter((v) => v === player).length
    const emptyCount = cells.filter((v) => v === null).length
    if (playerCount === 2 && emptyCount === 1) {
      return indices[cells.indexOf(null)]
    }
  }
  return null
}

function mediumMove(board: Board, bot: Player, human: Player): number {
  // 1. Win if possible
  const win = findWinningMove(board, bot)
  if (win !== null) return win

  // 2. Block opponent win
  const block = findWinningMove(board, human)
  if (block !== null) return block

  // 3. Random
  return easyMove(board)
}

// ─── Hard — Minimax ───────────────────────────────────────────────────

function minimax(
  board: Board,
  isMaximizing: boolean,
  bot: Player,
  human: Player,
): number {
  const winner = checkWinner(board)
  if (winner === bot) return 10
  if (winner === human) return -10

  const empties = emptyIndices(board)
  if (empties.length === 0) return 0

  if (isMaximizing) {
    let best = -Infinity
    for (const i of empties) {
      const score = minimax(applyMove(board, i, bot), false, bot, human)
      if (score > best) best = score
    }
    return best
  } else {
    let best = Infinity
    for (const i of empties) {
      const score = minimax(applyMove(board, i, human), true, bot, human)
      if (score < best) best = score
    }
    return best
  }
}

function hardMove(board: Board, bot: Player, human: Player): number {
  const empties = emptyIndices(board)

  // If board is mostly empty, prefer center then corners for speed
  if (empties.length === 9) return 4 // always take center first
  if (empties.length === 8 && board[4] !== null) {
    // Take a corner if center was taken
    const corners = [0, 2, 6, 8].filter((i) => board[i] === null)
    if (corners.length) return corners[Math.floor(Math.random() * corners.length)]
  }

  let bestScore = -Infinity
  let bestMove = empties[0]

  for (const i of empties) {
    const score = minimax(applyMove(board, i, bot), false, bot, human)
    if (score > bestScore) {
      bestScore = score
      bestMove = i
    }
  }

  return bestMove
}

// ─── Public API ───────────────────────────────────────────────────────

/**
 * Returns the index the bot will play on this turn.
 * `bot` is the bot's player symbol, `human` is the opponent.
 */
export function getBotMove(
  board: Board,
  bot: Player,
  human: Player,
  level: BotLevel,
): number {
  switch (level) {
    case 'easy':
      return easyMove(board)
    case 'medium':
      return mediumMove(board, bot, human)
    case 'hard':
      return hardMove(board, bot, human)
  }
}

/** Exported for use in useGameState */
export { checkWinner }
