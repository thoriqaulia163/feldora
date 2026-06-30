/**
 * Tic Tac Toe — Game Board
 *
 * Renders the 3×3 grid. Winning cells get a highlight accent.
 * X = purple (feldora-accent), O = orange (feldora-accent-secondary).
 */

import type { Board, Player } from './types'

interface GameBoardProps {
  readonly board: Board
  readonly onCellClick: (index: number) => void
  readonly winLine: [number, number, number] | null
  readonly disabled: boolean
}

const SYMBOL_STYLES: Record<Player, string> = {
  X: 'text-feldora-accent',
  O: 'text-feldora-accent-secondary',
}

const WIN_CELL_STYLES: Record<Player, string> = {
  X: 'bg-feldora-accent/10 border-feldora-accent/60',
  O: 'bg-feldora-accent-secondary/10 border-feldora-accent-secondary/60',
}

export function GameBoard({ board, onCellClick, winLine, disabled }: GameBoardProps) {
  const winSet = winLine ? new Set(winLine) : null

  return (
    <div
      className="grid grid-cols-3 gap-2 w-full max-w-xs mx-auto select-none"
      aria-label="Tic Tac Toe board"
    >
      {board.map((cell, index) => {
        const isWinCell = winSet?.has(index) ?? false
        const isEmpty = cell === null

        const baseClasses =
          'relative flex items-center justify-center aspect-square border transition-all duration-200'

        const stateClasses = isWinCell
          ? `${WIN_CELL_STYLES[cell as Player]} scale-105`
          : isEmpty && !disabled
            ? 'bg-feldora-surface-light border-white/20 hover:border-feldora-accent/60 hover:bg-feldora-surface-light cursor-pointer'
            : 'bg-feldora-surface-light border-white/15 cursor-default'

        // Corner-cut on bottom-right cell to echo the card-polygon pattern
        const clipClass = index === 8 ? 'clip-notch-br' : ''

        return (
          <button
            key={index}
            type="button"
            aria-label={cell ? `Cell ${index + 1}: ${cell}` : `Cell ${index + 1}: empty`}
            onClick={() => !disabled && isEmpty && onCellClick(index)}
            disabled={disabled || !isEmpty}
            className={`${baseClasses} ${stateClasses} ${clipClass}`}
          >
            {cell && (
              <span
                className={`text-4xl font-black leading-none tracking-tighter ${SYMBOL_STYLES[cell]} transition-all duration-150 ${isWinCell ? 'drop-shadow-[0_0_8px_currentColor]' : ''}`}
              >
                {cell}
              </span>
            )}

            {/* Subtle grid-line corner accents on empty cells */}
            {!cell && !disabled && (
              <>
                <span className="absolute top-1 left-1 w-2 h-2 border-t border-l border-white/25" />
                <span className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-white/25" />
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}
