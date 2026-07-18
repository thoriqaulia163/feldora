/**
 * Tic Tac Toe — Main Module Component
 */

import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useGameState } from './useGameState'
import { GameBoard } from './GameBoard'
import { ConfirmModal } from './ConfirmModal'
import { PLAYGROUND_COPY } from '~/constants/copy/playground'
import type { GameMode, BotLevel } from './types'

const C = PLAYGROUND_COPY.ticTacToe

type PendingAction =
  | { type: 'reset' }
  | { type: 'mode'; value: GameMode }
  | { type: 'level'; value: BotLevel }

// ─── Sub-components ───────────────────────────────────────────────────

function SegmentedControl<T extends string>({
  options, value, onChange, colorMap,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  colorMap?: Partial<Record<T, string>>
}) {
  return (
    <div className="flex">
      {options.map((opt) => {
        const isActive = opt.value === value
        const activeColor = colorMap?.[opt.value] ?? 'border-feldora-accent text-feldora-accent bg-feldora-accent/10'
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors duration-150 ${
              isActive
                ? activeColor
                : 'border-feldora-border/50 text-feldora-muted hover:text-feldora-text-secondary hover:border-feldora-border'
            }`}
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
  status, currentPlayer, winner, gameMode, botThinking,
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
        {C.statusIdle}
      </p>
    )
  }

  if (status === 'won' && winner) {
    const isX = winner === 'X'
    const color = isX ? 'text-feldora-accent' : 'text-feldora-accent-secondary'
    const label = gameMode === 'pvc'
      ? (isX ? C.statusWinYou : C.statusWinBot)
      : `Player ${winner} ${C.statusWins}`

    return (
      <div className="flex items-center justify-center gap-2">
        <span className={`text-xl font-black uppercase tracking-wider ${color}`}>{label}</span>
        <span className="text-feldora-muted font-mono text-xs">{winner} {C.statusTakesIt}</span>
      </div>
    )
  }

  if (status === 'draw') {
    return (
      <p className="text-feldora-text-secondary font-bold text-base uppercase tracking-wider text-center">
        {C.statusDraw}
      </p>
    )
  }

  if (botThinking) {
    return (
      <div className="flex items-center justify-center gap-2">
        <div className="w-3 h-3 border-2 border-feldora-accent-secondary border-t-transparent rounded-full animate-spin" />
        <span className="text-feldora-muted font-mono text-xs uppercase tracking-wider">
          {C.statusBotThinking}
        </span>
      </div>
    )
  }

  const isX = currentPlayer === 'X'
  const color = isX ? 'text-feldora-accent' : 'text-feldora-accent-secondary'
  const turnLabel = gameMode === 'pvc' && !isX
    ? C.statusBotTurn
    : gameMode === 'pvp'
      ? `Player ${currentPlayer}${C.statusPlayerTurnSuffix}`
      : C.statusYourTurn

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

  const isInProgress = game.moveCount > 0 && (game.status === 'playing' || game.status === 'idle')

  function handleModeChange(mode: GameMode) {
    if (mode === game.gameMode) return
    if (isInProgress) setPending({ type: 'mode', value: mode })
    else game.setGameMode(mode)
  }

  function handleLevelChange(level: BotLevel) {
    if (level === game.botLevel) return
    if (isInProgress) setPending({ type: 'level', value: level })
    else game.setBotLevel(level)
  }

  function handleReset() {
    if (isInProgress) setPending({ type: 'reset' })
    else game.resetGame()
  }

  function handleConfirm() {
    if (!pending) return
    if (pending.type === 'reset') game.resetGame()
    else if (pending.type === 'mode') game.setGameMode(pending.value)
    else if (pending.type === 'level') game.setBotLevel(pending.value)
    setPending(null)
  }

  const modalProps = (() => {
    if (!pending) return null
    if (pending.type === 'reset') {
      return { title: C.modalResetTitle, message: C.modalResetMessage, confirmLabel: C.modalResetConfirm }
    }
    if (pending.type === 'mode') {
      const label = C.modes[pending.value]
      return {
        title: C.modalSwitchModeTitle,
        message: `${C.modalSwitchModePrefix} ${label} ${C.modalSwitchModeSuffix}`,
        confirmLabel: C.modalSwitchConfirm,
      }
    }
    const label = C.levels[pending.value]
    return {
      title: C.modalChangeDiffTitle,
      message: `${C.modalSwitchModePrefix} ${label} ${C.modalSwitchModeSuffix}`,
      confirmLabel: C.modalSwitchConfirm,
    }
  })()

  const modeOptions: { value: GameMode; label: string }[] = [
    { value: 'pvp', label: C.modeOptions.pvp },
    { value: 'pvc', label: C.modeOptions.pvc },
  ]

  const levelOptions: { value: BotLevel; label: string }[] = [
    { value: 'easy',   label: C.levelOptions.easy },
    { value: 'medium', label: C.levelOptions.medium },
    { value: 'hard',   label: C.levelOptions.hard },
  ]

  const levelColorMap: Partial<Record<BotLevel, string>> = {
    easy:   'border-emerald-500/50 text-emerald-400 bg-emerald-500/10',
    medium: 'border-amber-500/50 text-amber-400 bg-amber-500/10',
    hard:   'border-red-500/50 text-red-400 bg-red-500/10',
  }

  const boardDisabled =
    game.status === 'won' ||
    game.status === 'draw' ||
    game.botThinking ||
    (game.gameMode === 'pvc' && game.currentPlayer === 'O' && game.status === 'playing')

  return (
    <div className="space-y-8">
      <Link
        to="/playground"
        className="inline-flex items-center gap-2 text-feldora-text-secondary text-sm hover:text-feldora-accent transition-colors duration-200 group"
      >
        <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
        {C.backLabel}
      </Link>

      <div className="flex items-center gap-3">
        <div className="diamond-marker !w-2.5 !h-2.5" />
        <h2 className="text-lg font-bold uppercase tracking-wider">{C.name}</h2>
      </div>

      <div className="flex flex-col items-center gap-6">

        {/* Mode selector */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider">
            {C.modeSectionLabel}
          </span>
          <SegmentedControl
            options={modeOptions}
            value={game.gameMode}
            onChange={handleModeChange}
          />
        </div>

        {/* Bot level */}
        {game.gameMode === 'pvc' && (
          <div className="flex flex-col items-center gap-2">
            <span className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider">
              {C.levelSectionLabel}
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-feldora-accent text-base leading-none">X</span>
            <span className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider">
              {game.gameMode === 'pvp' ? C.legendPlayer1 : C.legendYou}
            </span>
          </div>
          <div className="w-px h-4 bg-feldora-border/40" />
          <div className="flex items-center gap-1.5">
            <span className="font-black text-feldora-accent-secondary text-base leading-none">O</span>
            <span className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider">
              {game.gameMode === 'pvp' ? C.legendPlayer2 : C.legendBot}
            </span>
          </div>
        </div>

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

        {/* Reset */}
        <button
          type="button"
          onClick={handleReset}
          className="btn-angular-primary !px-8 !py-2 !text-[11px] w-full max-w-xs"
        >
          {C.resetButton}
        </button>
      </div>

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
