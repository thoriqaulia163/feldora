import { createFileRoute } from '@tanstack/react-router'
import { WEB_UPDATE_LOG } from '~/constants/updateLog'
import { LogCard } from '~/components/ui/LogCard'
import { PageHeader } from '~/components/ui/PageHeader'
import { LOG_COPY } from '~/constants/copy'

export const Route = createFileRoute('/log')({
  head: () => ({
    meta: [{ title: 'FELDORA — Update Log' }],
  }),
  component: LogPage,
})

function LogPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <section className="px-6 md:px-12 lg:px-20 max-w-5xl mx-auto">
        <div className="mb-16 relative">
          <PageHeader
            label={LOG_COPY.header.label}
            title={<>{LOG_COPY.header.heading} <span className="text-feldora-accent">{LOG_COPY.header.headingAccent}</span></>}
            description={LOG_COPY.header.description}
          />
        </div>

        <div className="relative space-y-3">
          <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-feldora-accent/40 via-feldora-border/30 to-transparent" />

          {WEB_UPDATE_LOG.map((entry, index) => (
            <div key={index} className="relative pl-12 group">
              <div className="absolute left-[8px] top-5 w-[16px] h-[16px] rotate-45 border-2 border-feldora-border bg-feldora-bg group-hover:border-feldora-accent transition-colors duration-300">
                {index === 0 && (
                  <div className="absolute inset-[2px] bg-feldora-accent rotate-0" />
                )}
              </div>
              <LogCard
                entry={entry}
                number={WEB_UPDATE_LOG.length - index}
                showAccentBar
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
