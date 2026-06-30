/**
 * Tic Tac Toe — Main Module Component
 *
 * Layout:
 *   - Back link + title
 *   - Mode selector (PvP / PvC)
 *   - Bot level selector (Easy / Medium / Hard) — PvC only
 *   - Board
 *   - Status bar (whose turn / winner / draw)
 *   - Reset button
 *   - How to play info box
 */

import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useGameState } from './useGameState'
import { GameBoard } from './GameBoard'
import { ConfirmModal } from './ConfirmModal'
import type { GameMode, BotLevel } from './types'

// ─── Confirm modal state type ─────────────────────────────────────────
type PendingAction =
  | { type: 'reset' }
  | { type: 'mode'; value: GameMode }
  | { type: 'level'; value: BotLevel }

// ─── Sub-components ───────────────────────────────────────────────────

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  colorMap,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  colorMap?: Partial<Record<T, string>>
}) {
  return (
    <div className="flex">
      {options.map((opt, i) => {
        const isActive = opt.value === value
        const activeColor = colorMap?.[opt.value] ?? 'border-feldora-accent text-feldora-accent bg-feldora-accent/10'
        const roundLeft = i === 0 ? 'border-r-0' : ''
        const roundRight = i === options.length - 1 ? '' : 'border-r-0'

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors duration-150 ${
              isActive
                ? activeColor
                : 'border-feldora-border/50 text-feldora-muted hover:text-feldora-text-secondary hover:border-feldora-border'
            } ${roundLeft} ${roundRight}`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Status bar ───────────────────────────────────────────────────────

function StatusBar({
  status,
  currentPlayer,
  winner,
  gameMode,
  botThinking,
}: {
  status: ReturnType<typeof useGameState>['status']
  currentPlayer: ReturnType<typeof useGameState>['currentPlayer']
  winner: ReturnType<typeof useGameState>['winner']
  gameMode: GameMode
  botThinking: boolean
}) {
  if (status === 'idle') {
    return (
      <p className="text-feldora-muted font-mono text-xs uppercase tracking-wider text-center">
        Click a cell to start
      </p>
    )
  }

  if (status === 'won' && winner) {
    const isX = winner === 'X'
    const color = isX ? 'text-feldora-accent' : 'text-feldora-accent-secondary'
    const label =
      gameMode === 'pvc'
        ? isX
          ? 'You Win!'
          : 'Bot Wins!'
        : `Player ${winner} Wins!`

    return (
      <div className="flex items-center justify-center gap-2">
        <span className={`text-xl font-black uppercase tracking-wider ${color}`}>{label}</span>
        <span className="text-feldora-muted font-mono text-xs">{winner} takes it</span>
      </div>
    )
  }

  if (status === 'draw') {
    return (
      <p className="text-feldora-text-secondary font-bold text-base uppercase tracking-wider text-center">
        It&apos;s a Draw
      </p>
    )
  }

  // playing
  if (botThinking) {
    return (
      <div className="flex items-center justify-center gap-2">
        <div className="w-3 h-3 border-2 border-feldora-accent-secondary border-t-transparent rounded-full animate-spin" />
        <span className="text-feldora-muted font-mono text-xs uppercase tracking-wider">
          Bot thinking...
        </span>
      </div>
    )
  }

  const isX = currentPlayer === 'X'
  const color = isX ? 'text-feldora-accent' : 'text-feldora-accent-secondary'
  const turnLabel =
    gameMode === 'pvc' && !isX
      ? "Bot's turn"
      : gameMode === 'pvp'
        ? `Player ${currentPlayer}'s turn`
        : "Your turn"

  return (
    <div className="flex items-center justify-center gap-2">
      <span className={`font-black text-lg ${color}`}>{currentPlayer}</span>
      <span className="text-feldora-text-secondary font-mono text-xs uppercase tracking-wider">
        {turnLabel}
      </span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────

export default function TicTacToeModule() {
  const game = useGameState()
  const [pending, setPending] = useState<PendingAction | null>(null)

  // A game is "in progress" when at least one move has been made and it hasn't ended
  const isInProgress = game.moveCount > 0 && (game.status === 'playing' || game.status === 'idle')

  // ─── Action handlers with confirm gate ─────────────────────────────

  function handleModeChange(mode: GameMode) {
    if (mode === game.gameMode) return
    if (isInProgress) {
      setPending({ type: 'mode', value: mode })
    } else {
      game.setGameMode(mode)
    }
  }

  function handleLevelChange(level: BotLevel) {
    if (level === game.botLevel) return
    if (isInProgress) {
      setPending({ type: 'level', value: level })
    } else {
      game.setBotLevel(level)
    }
  }

  function handleReset() {
    if (isInProgress) {
      setPending({ type: 'reset' })
    } else {
      game.resetGame()
    }
  }

  function handleConfirm() {
    if (!pending) return
    if (pending.type === 'reset') game.resetGame()
    else if (pending.type === 'mode') game.setGameMode(pending.value)
    else if (pending.type === 'level') game.setBotLevel(pending.value)
    setPending(null)
  }

  // ─── Modal copy ─────────────────────────────────────────────────────

  const modalProps = (() => {
    if (!pending) return null
    if (pending.type === 'reset') {
      return {
        title: 'Reset Game?',
        message: 'The current game will be cleared and a new one will start.',
        confirmLabel: 'Reset',
      }
    }
    if (pending.type === 'mode') {
      const label = pending.value === 'pvp' ? 'Player vs Player' : 'Player vs Computer'
      return {
        title: 'Switch Mode?',
        message: `Switching to ${label} will reset the current game.`,
        confirmLabel: 'Switch',
      }
    }
    // level
    const labels: Record<BotLevel, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }
    return {
      title: 'Change Difficulty?',
      message: `Switching to ${labels[pending.value]} will reset the current game.`,
      confirmLabel: 'Switch',
    }
  })()

  // ─── Options ────────────────────────────────────────────────────────

  const modeOptions: { value: GameMode; label: string }[] = [
    { value: 'pvp', label: 'PvP' },
    { value: 'pvc', label: 'PvC' },
  ]

  const levelOptions: { value: BotLevel; label: string }[] = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Med' },
    { value: 'hard', label: 'Hard' },
  ]

  const levelColorMap: Partial<Record<BotLevel, string>> = {
    easy: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10',
    medium: 'border-amber-500/50 text-amber-400 bg-amber-500/10',
    hard: 'border-red-500/50 text-red-400 bg-red-500/10',
  }

  // Board is non-interactive when game is over, or when it's bot's turn in PvC
  const boardDisabled =
    game.status === 'won' ||
    game.status === 'draw' ||
    game.botThinking ||
    (game.gameMode === 'pvc' && game.currentPlayer === 'O' && game.status === 'playing')

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        to="/playground"
        className="inline-flex items-center gap-2 text-feldora-text-secondary text-sm hover:text-feldora-accent transition-colors duration-200 group"
      >
        <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
        Back to modules
      </Link>

      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="diamond-marker !w-2.5 !h-2.5" />
        <h2 className="text-lg font-bold uppercase tracking-wider">Tic Tac Toe</h2>
      </div>

      {/* Controls + Board */}
      <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-start">

        {/* Left: Controls */}
        <div className="space-y-6">

          {/* Mode selector */}
          <div>
            <span className="block text-feldora-muted font-mono text-[10px] uppercase tracking-wider mb-2">
              Game Mode
            </span>
            <SegmentedControl
              options={modeOptions}
              value={game.gameMode}
              onChange={handleModeChange}
            />
          </div>

          {/* Bot level — only in PvC */}
          {game.gameMode === 'pvc' && (
            <div>
              <span className="block text-feldora-muted font-mono text-[10px] uppercase tracking-wider mb-2">
                Bot Difficulty
              </span>
              <SegmentedControl
                options={levelOptions}
                value={game.botLevel}
                onChange={handleLevelChange}
                colorMap={levelColorMap}
              />
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-feldora-accent text-base leading-none">X</span>
              <span className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider">
                {game.gameMode === 'pvp' ? 'Player 1' : 'You'}
              </span>
            </div>
            <div className="w-px h-4 bg-feldora-border/40" />
            <div className="flex items-center gap-1.5">
              <span className="font-black text-feldora-accent-secondary text-base leading-none">O</span>
              <span className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider">
                {game.gameMode === 'pvp' ? 'Player 2' : 'Bot'}
              </span>
            </div>
          </div>

          {/* How to play */}
          <div className="bg-feldora-surface border border-feldora-border/30 p-4 clip-notch-br hidden lg:block">
            <div className="flex items-center gap-2 mb-3">
              <div className="hex-badge w-5 h-5 text-[8px] font-bold text-white">?</div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-feldora-text">How to Play</h4>
            </div>
            <ul className="space-y-1.5 text-feldora-text-secondary text-xs leading-relaxed list-disc pl-4">
              <li>Get <span className="text-feldora-text">3 in a row</span> — horizontal, vertical, or diagonal</li>
              <li><span className="text-feldora-accent font-bold">X</span> always goes first</li>
              <li>
                <span className="text-feldora-text">PvP</span> — two players take turns on the same device
              </li>
              <li>
                <span className="text-feldora-text">PvC</span> — you play as X, bot plays as O
              </li>
              <li>
                Bot difficulty: <span className="text-emerald-400">Easy</span> (random) ·{' '}
                <span className="text-amber-400">Medium</span> (win/block/random) ·{' '}
                <span className="text-red-400">Hard</span> (unbeatable)
              </li>
            </ul>
          </div>
        </div>

        {/* Right: Board area */}
        <div className="flex flex-col items-center gap-6 w-full lg:w-auto">

          {/* Board */}
          <div className="w-full max-w-xs">
            <GameBoard
              board={game.board}
              onCellClick={game.makeMove}
              winLine={game.winLine}
              disabled={boardDisabled}
            />
          </div>

          {/* Status */}
          <div className="h-8 flex items-center justify-center w-full">
            <StatusBar
              status={game.status}
              currentPlayer={game.currentPlayer}
              winner={game.winner}
              gameMode={game.gameMode}
              botThinking={game.botThinking}
            />
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={handleReset}
            className="btn-angular-outline !px-8 !py-2 !text-[11px] w-full max-w-xs"
          >
            Reset Game
          </button>
        </div>
      </div>

      {/* How to play — mobile only */}
      <div className="bg-feldora-surface border border-feldora-border/30 p-4 clip-notch-br lg:hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className="hex-badge w-5 h-5 text-[8px] font-bold text-white">?</div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-feldora-text">How to Play</h4>
        </div>
        <ul className="space-y-1.5 text-feldora-text-secondary text-xs leading-relaxed list-disc pl-4">
          <li>Get <span className="text-feldora-text">3 in a row</span> — horizontal, vertical, or diagonal</li>
          <li><span className="text-feldora-accent font-bold">X</span> always goes first</li>
          <li><span className="text-feldora-text">PvP</span> — two players take turns on the same device</li>
          <li><span className="text-feldora-text">PvC</span> — you play as X, bot plays as O</li>
          <li>
            Bot difficulty: <span className="text-emerald-400">Easy</span> (random) ·{' '}
            <span className="text-amber-400">Medium</span> (win/block/random) ·{' '}
            <span className="text-red-400">Hard</span> (unbeatable)
          </li>
        </ul>
      </div>

      {/* Confirm Modal */}
      {pending && modalProps && (
        <ConfirmModal
          open
          title={modalProps.title}
          message={modalProps.message}
          confirmLabel={modalProps.confirmLabel}
          onConfirm={handleConfirm}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  )
}
