import { Link } from '@tanstack/react-router'
import { WEB_UPDATE_LOG } from '~/constants/updateLog'
import { LogCard } from '~/components/ui/LogCard'
import { SectionHeader } from '~/components/ui/SectionHeader'
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
        <div className="mb-14">
          <SectionHeader
            label={HOME_COPY.updates.label}
            heading={HOME_COPY.updates.heading}
            headingAccent={HOME_COPY.updates.headingAccent}
            trailing={
              <Link to="/log" className="btn-angular-outline text-xs">
                {HOME_COPY.updates.cta}
              </Link>
            }
          />
        </div>

        <div className="space-y-3">
          {latestEntries.map((entry, i) => (
            <LogCard
              key={entry.version}
              entry={entry}
              number={WEB_UPDATE_LOG.length - i}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
