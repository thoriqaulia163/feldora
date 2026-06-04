import type { ReactNode } from 'react'

interface PageHeaderProps {
  label: string
  title: ReactNode
  description?: string
}

export function PageHeader({ label, title, description }: PageHeaderProps) {
  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="diamond-marker" />
        <span className="text-feldora-accent font-mono text-xs uppercase tracking-[0.3em]">
          {label}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-feldora-accent/30 to-transparent max-w-32" />
      </div>
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[0.85]">
        {title}
      </h1>
      {description && (
        <div className="mt-6 pl-4 border-l-2 border-feldora-accent/50 max-w-2xl">
          <p className="text-feldora-text-secondary text-lg leading-relaxed">
            {description}
          </p>
        </div>
      )}
    </div>
  )
}
