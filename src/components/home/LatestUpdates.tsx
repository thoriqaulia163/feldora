import { Link } from '@tanstack/react-router'
import { WEB_UPDATE_LOG } from '~/constants/updateLog'
import { LogCard } from '~/components/ui/LogCard'
import { HOME_COPY } from '~/constants/copy'

export function LatestUpdates() {
  const latestEntries = WEB_UPDATE_LOG.slice(0, 4)

  return (
    <section className="relative py-28 px-6 md:px-12 lg:px-20 overflow-hidden">
      <div className="absolute inset-0 bg-feldora-surface/40 -skew-y-1 origin-top-left" />
      <div className="absolute top-0 left-0 right-0 h-[2px]">
        <div className="absolute left-0 w-1/3 h-full bg-gradient-to-r from-feldora-accent/50 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[2px]">
        <div className="absolute right-0 w-1/4 h-full bg-gradient-to-l from-feldora-accent/30 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-14 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="diamond-marker" />
              <span className="text-feldora-accent font-mono text-xs uppercase tracking-[0.3em]">
                {HOME_COPY.updates.label}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
              {HOME_COPY.updates.heading} <span className="text-feldora-accent">{HOME_COPY.updates.headingAccent}</span>
            </h2>
          </div>
          <Link to="/log" className="btn-angular-outline text-xs">
            {HOME_COPY.updates.cta}
          </Link>
        </div>

        <div className="space-y-3">
          {latestEntries.map((entry, i) => (
            <LogCard
              key={i}
              entry={entry}
              number={WEB_UPDATE_LOG.length - i}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
