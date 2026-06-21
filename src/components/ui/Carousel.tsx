import { useState, useEffect, useCallback, type ReactNode } from 'react'

export interface CarouselProps {
  /** Array of slide content to render */
  children: ReactNode[]
  /** Enable auto-scroll */
  autoScroll?: boolean
  /** Auto-scroll interval in milliseconds (default: 10000) */
  interval?: number
  /** Pause auto-scroll on hover (default: true) */
  pauseOnHover?: boolean
  /** Minimum height for the slide container */
  minHeight?: string
  /** Show dot indicators (default: true) */
  showIndicators?: boolean
  /** Show slide counter (default: true) */
  showCounter?: boolean
  /** Show prev/next navigation arrows (default: true) */
  showArrows?: boolean
}

export function Carousel({
  children,
  autoScroll = false,
  interval = 10000,
  pauseOnHover = true,
  minHeight = 'min-h-[400px] md:min-h-[450px]',
  showIndicators = true,
  showCounter = true,
  showArrows = true,
}: CarouselProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = children.length

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total)
  }, [total])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total)
  }, [total])

  const goTo = (index: number) => setCurrent(index)

  // Auto-advance
  useEffect(() => {
    if (!autoScroll || paused) return
    const timer = setInterval(next, interval)
    return () => clearInterval(timer)
  }, [autoScroll, interval, next, paused])

  return (
    <div
      onMouseEnter={pauseOnHover ? () => setPaused(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setPaused(false) : undefined}
    >
      {/* Slides */}
      <div className={`relative ${minHeight} flex items-center`}>
        {children.map((child, i: number) => {
          let stateClass = 'opacity-0 translate-x-8 pointer-events-none'
          if (i === current) stateClass = 'opacity-100 translate-x-0 pointer-events-auto'
          else if (i < current) stateClass = 'opacity-0 -translate-x-8 pointer-events-none'

          return (
            <div
              key={i}
              className={`absolute inset-0 flex items-center transition-all duration-700 ease-in-out ${stateClass}`}
              aria-hidden={i !== current}
            >
              {child}
            </div>
          )
        })}
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between mt-10">
        {/* Dot indicators */}
        {showIndicators ? (
          <div className="flex items-center gap-3">
            {children.map((_, i: number) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all duration-300 ${
                  i === current
                    ? 'w-8 h-2 bg-feldora-accent-secondary'
                    : 'w-2 h-2 bg-feldora-border hover:bg-feldora-muted'
                }`}
              />
            ))}
            {showCounter && (
              <span className="ml-3 text-feldora-muted font-mono text-[10px] uppercase tracking-wider">
                {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
            )}
          </div>
        ) : (
          <div />
        )}

        {/* Prev / Next arrows */}
        {showArrows && (
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              aria-label="Previous slide"
              className="w-9 h-9 flex items-center justify-center border border-feldora-accent-secondary/50 text-feldora-accent-secondary hover:bg-feldora-accent-secondary hover:text-white transition-all duration-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 12L6 8l4-4" />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Next slide"
              className="w-9 h-9 flex items-center justify-center border border-feldora-accent-secondary/50 text-feldora-accent-secondary hover:bg-feldora-accent-secondary hover:text-white transition-all duration-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 4l4 4-4 4" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
