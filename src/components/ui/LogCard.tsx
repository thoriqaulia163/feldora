import { useState } from 'react'
import type { UpdateEntry, UpdateCategory } from '~/constants/updateLog'

interface LogCardProps {
  entry: UpdateEntry
  number: number
  showAccentBar?: boolean
}

const STATUS_STYLES: Record<UpdateEntry['status'], { label: string; className: string }> = {
  major: { label: 'Major', className: 'border-feldora-accent text-feldora-accent' },
  moderate: { label: 'Moderate', className: 'border-amber-400/60 text-amber-400' },
  minor: { label: 'Minor', className: 'border-feldora-muted text-feldora-muted' },
}

const CATEGORY_CONFIG: Record<UpdateCategory, { label: string; color: string }> = {
  update: { label: 'Update', color: 'text-emerald-400' },
  fixing: { label: 'Fixing', color: 'text-orange-400' },
  refactor: { label: 'Refactor', color: 'text-amber-400' },
  revamp: { label: 'Revamp', color: 'text-sky-400' },
}

function CategoryIcon({ type }: { type: UpdateCategory }) {
  const config = CATEGORY_CONFIG[type]

  if (type === 'update') {
    // Circle with arrow up
    return (
      <svg className={`w-3.5 h-3.5 ${config.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }

  if (type === 'fixing') {
    // Wrench + screwdriver crossed (Heroicons)
    return (
      <svg className={`w-3.5 h-3.5 ${config.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M11.42 15.17L17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.276a3 3 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008z" />
      </svg>
    )
  }

  if (type === 'revamp') {
    // Sparkles icon
    return (
      <svg className={`w-3.5 h-3.5 ${config.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    )
  }

  // refactor - Broom icon (Font Awesome)
  return (
    <svg className={`w-3.5 h-3.5 ${config.color}`} fill="currentColor" viewBox="0 -64 640 640">
      <path d="M256.47 216.77l86.73 109.18s-16.6 102.36-76.57 150.12C206.66 523.85 0 510.19 0 510.19s3.8-23.14 11-55.43l94.62-112.17c3.97-4.7-.87-11.62-6.65-9.5l-60.4 22.09c14.44-41.66 32.72-80.04 54.6-97.47 59.97-47.76 163.3-40.94 163.3-40.94zM636.53 31.03l-19.86-25c-5.49-6.9-15.52-8.05-22.41-2.56l-232.48 177.8-34.14-42.97c-5.09-6.41-15.14-5.21-18.59 2.21l-25.33 54.55 86.73 109.18 58.8-12.45c8-1.69 11.42-11.2 6.34-17.6l-34.09-42.92 232.48-177.8c6.89-5.48 8.04-15.53 2.55-22.44z" />
    </svg>
  )
}

export function LogCard({ entry, number, showAccentBar = false }: LogCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const statusStyle = STATUS_STYLES[entry.status]
  const categoryConfig = CATEGORY_CONFIG[entry.type]

  return (
    <div
      role="button"
      tabIndex={0}
      className="group relative clip-notch-br bg-feldora-surface border border-feldora-border/40 hover:border-feldora-accent/30 transition-all duration-300 cursor-pointer select-none overflow-hidden"
      onClick={() => setIsOpen(!isOpen)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setIsOpen(!isOpen)
        }
      }}
    >
      {showAccentBar && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-feldora-accent/0 group-hover:bg-feldora-accent transition-colors duration-300" />
      )}

      {/* Header */}
      <div className="p-5 pl-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-3 shrink-0">
            <div className="hex-badge w-7 h-7 text-[9px] font-bold text-white shrink-0">
              {number}
            </div>
            <div className="flex flex-col sm:w-36">
              <span className="text-feldora-muted font-mono text-xs">
                {entry.date}
              </span>
              <span className="text-feldora-muted/60 font-mono text-[10px]">
                v{entry.version}
              </span>
            </div>
            {/* Status & type: pushed to right on mobile, inline on desktop */}
            <div className="flex items-center gap-2 ml-auto sm:ml-0">
              <span className={`font-mono text-[9px] uppercase tracking-wider border px-2 py-0.5 w-16 text-center ${statusStyle.className}`}>
                {statusStyle.label}
              </span>
              <div className="relative group/type">
                <div className="flex items-center justify-center w-6 h-6 shrink-0">
                  <CategoryIcon type={entry.type} />
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-full mr-2 px-2 py-1 bg-feldora-surface-light border border-feldora-border rounded text-[10px] font-mono uppercase tracking-wider text-feldora-text whitespace-nowrap opacity-0 group-hover/type:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                  {categoryConfig.label}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <p className={`text-feldora-text text-sm leading-relaxed group-hover:text-white transition-colors duration-300 ${isOpen ? '' : 'truncate'}`}>
              {entry.title}
            </p>
          </div>
          <svg
            className={`w-4 h-4 shrink-0 text-feldora-accent-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Accordion content */}
      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-6 pb-5 pt-0 border-t border-feldora-border/30 ml-6 mr-6">
          <p className="text-feldora-text-secondary text-sm leading-relaxed pt-4">
            {entry.description}
          </p>
        </div>
      </div>
    </div>
  )
}
