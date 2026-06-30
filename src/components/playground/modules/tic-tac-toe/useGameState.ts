/**
 * Tic Tac Toe — Game State Hook
 *
 * Owns all game logic: move handling, win detection, bot turns, mode/level switching.
 * Bot always plays as 'O', human always plays as 'X'.
 * In PvP both players alternate manually.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import type { Board, GameMode, BotLevel, Player, GameState } from './types'
import { WIN_LINES } from './types'
import { getBotMove, checkWinner } from './botEngine'

// ─── Initial state ────────────────────────────────────────────────────

const EMPTY_BOARD: Board = [null, null, null, null, null, null, null, null, null]

function makeInitialState(mode: GameMode, level: BotLevel): GameState {
  return {
    board: [...EMPTY_BOARD] as Board,
    currentPlayer: 'X',
    status: 'idle',
    winner: null,
    winLine: null,
    gameMode: mode,
    botLevel: level,
    moveCount: 0,
  }
}

// ─── Win / draw check ─────────────────────────────────────────────────

function getWinLine(board: Board, player: Player): [number, number, number] | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line
    if (board[a] === player && board[b] === player && board[c] === player) {
      return line
    }
  }
  return null
}

// ─── Hook ─────────────────────────────────────────────────────────────

export interface GameStateHook extends GameState {
  /** Human (or current PvP player) clicks a cell */
  makeMove: (index: number) => void
  /** Hard-reset to initial state, keeping mode & level */
  resetGame: () => void
  /** Change game mode — caller is responsible for showing confirm if needed */
  setGameMode: (mode: GameMode) => void
  /** Change bot level — caller is responsible for showing confirm if needed */
  setBotLevel: (level: BotLevel) => void
  /** True while bot is "thinking" (async delay) */
  botThinking: boolean
}

export function useGameState(): GameStateHook {
  const [state, setState] = useState<GameState>(() => makeInitialState('pvp', 'medium'))
  const [botThinking, setBotThinking] = useState(false)

  // Ref to always have current state inside async bot timeout
  const stateRef = useRef(state)
  stateRef.current = state

  // ─── Bot turn effect ────────────────────────────────────────────────
  useEffect(() => {
    const { gameMode, botLevel, currentPlayer, status, board } = state

    // Only fire when it's PvC mode, O's turn, and game is still going
    if (gameMode !== 'pvc' || currentPlayer !== 'O' || status !== 'playing') return

    setBotThinking(true)

    // Slight delay so the UI visually updates before bot "responds"
    const timer = setTimeout(() => {
      const current = stateRef.current
      // Double-check status hasn't changed during the timeout
      if (current.status !== 'playing' || current.currentPlayer !== 'O') {
        setBotThinking(false)
        return
      }

      const botIndex = getBotMove(current.board, 'O', 'X', botLevel)

      setState((prev) => {
        if (prev.status !== 'playing' || prev.currentPlayer !== 'O') return prev
        return applyMove(prev, botIndex)
      })

      setBotThinking(false)
    }, 400)

    return () => clearTimeout(timer)
    // board is included so the effect re-evaluates after each move
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentPlayer, state.status, state.gameMode, state.board])

  // ─── applyMove (pure, used inside setState) ─────────────────────────
  function applyMove(prev: GameState, index: number): GameState {
    if (prev.board[index] !== null || prev.status === 'won' || prev.status === 'draw') {
      return prev
    }

    const newBoard = [...prev.board] as Board
    newBoard[index] = prev.currentPlayer

    const winner = checkWinner(newBoard)
    if (winner) {
      return {
        ...prev,
        board: newBoard,
        status: 'won',
        winner,
        winLine: getWinLine(newBoard, winner),
        moveCount: prev.moveCount + 1,
      }
    }

    const isDraw = newBoard.every((c) => c !== null)
    if (isDraw) {
      return {
        ...prev,
        board: newBoard,
        status: 'draw',
        moveCount: prev.moveCount + 1,
      }
    }

    return {
      ...prev,
      board: newBoard,
      currentPlayer: prev.currentPlayer === 'X' ? 'O' : 'X',
      status: 'playing',
      moveCount: prev.moveCount + 1,
    }
  }

  // ─── Public actions ──────────────────────────────────────────────────

  const makeMove = useCallback((index: number) => {
    setState((prev) => {
      // Ignore taps when game is over, cell is taken, or it's bot's turn
      if (
        prev.status === 'won' ||
        prev.status === 'draw' ||
        prev.board[index] !== null ||
        botThinking
      ) {
        return prev
      }
      // In PvC mode, human is always X — block O's turn from human input
      if (prev.gameMode === 'pvc' && prev.currentPlayer === 'O') return prev

      // Transition from idle → playing on first move
      const base: GameState =
        prev.status === 'idle' ? { ...prev, status: 'playing' } : prev

      return applyMove(base, index)
    })
  }, [botThinking])

  const resetGame = useCallback(() => {
    setState((prev) => makeInitialState(prev.gameMode, prev.botLevel))
    setBotThinking(false)
  }, [])

  const setGameMode = useCallback((mode: GameMode) => {
    setState((prev) => makeInitialState(mode, prev.botLevel))
    setBotThinking(false)
  }, [])

  const setBotLevel = useCallback((level: BotLevel) => {
    setState((prev) => makeInitialState(prev.gameMode, level))
    setBotThinking(false)
  }, [])

  return {
    ...state,
    makeMove,
    resetGame,
    setGameMode,
    setBotLevel,
    botThinking,
  }
}
