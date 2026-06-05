import type { ReactNode } from 'react'

interface SectionHeaderProps {
  label: string
  heading: string
  headingAccent: string
  /** Override heading size — default is "text-4xl md:text-5xl" */
  headingSize?: string
  /** Extra element to the right of the header (e.g. CTA link, decorative line) */
  trailing?: ReactNode
}

export function SectionHeader({
  label,
  heading,
  headingAccent,
  headingSize = 'text-4xl md:text-5xl',
  trailing,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="diamond-marker" />
          <span className="text-feldora-accent-secondary font-mono text-xs uppercase tracking-[0.3em]">
            {label}
          </span>
        </div>
        <h2 className={`${headingSize} font-black uppercase tracking-tight`}>
          {heading} <span className="text-feldora-accent">{headingAccent}</span>
        </h2>
      </div>
      {trailing}
    </div>
  )
}
