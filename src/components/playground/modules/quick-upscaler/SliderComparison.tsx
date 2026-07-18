import { useCallback, useRef } from 'react'
import { PLAYGROUND_COPY } from '~/constants/copy/playground'

const C = PLAYGROUND_COPY.quickUpscaler

interface SliderComparisonProps {
  readonly originalURL: string
  readonly resultURL: string
  readonly resultWidth: number
  readonly resultHeight: number
  readonly position: number
  readonly onPositionChange: (pos: number) => void
}

export function SliderComparison({
  originalURL,
  resultURL,
  resultWidth,
  resultHeight,
  position,
  onPositionChange,
}: SliderComparisonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const draggingRef  = useRef(false)

  const updateFromPointer = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    onPositionChange(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)))
  }, [onPositionChange])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    draggingRef.current = true
    updateFromPointer(e.clientX)
  }, [updateFromPointer])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return
    updateFromPointer(e.clientX)
  }, [updateFromPointer])

  const onPointerUp = useCallback(() => { draggingRef.current = false }, [])

  const pct = `${(position * 100).toFixed(1)}%`

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden select-none touch-none cursor-ew-resize bg-feldora-bg"
        style={{ aspectRatio: `${resultWidth} / ${resultHeight}` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Result — base layer */}
        <img
          src={resultURL}
          alt={C.sliderResultAlt}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          draggable={false}
        />

        {/* Original — overlay, clipped left of divider */}
        <img
          src={originalURL}
          alt={C.sliderOriginalAlt}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{ clipPath: `inset(0 ${((1 - position) * 100).toFixed(2)}% 0 0)` }}
          draggable={false}
        />

        {/* Divider */}
        <div className="absolute top-0 bottom-0 w-px bg-white/80 pointer-events-none" style={{ left: pct }} />

        {/* Handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center pointer-events-none"
          style={{ left: pct }}
        >
          <svg className="w-4 h-4 text-feldora-bg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
          </svg>
        </div>

        {/* Labels */}
        <span className="absolute top-2 left-2 font-mono text-[9px] uppercase tracking-widest text-white/70 bg-black/40 px-1.5 py-0.5 pointer-events-none">
          {C.sliderOriginalLabel}
        </span>
        <span className="absolute top-2 right-2 font-mono text-[9px] uppercase tracking-widest text-white/70 bg-black/40 px-1.5 py-0.5 pointer-events-none">
          {C.sliderResultLabel}
        </span>
      </div>

      <p className="text-feldora-muted font-mono text-[10px] text-center">
        {resultWidth} × {resultHeight} px — {C.sliderHint}
      </p>
    </div>
  )
}
