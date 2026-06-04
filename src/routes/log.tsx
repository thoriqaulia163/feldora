import { createFileRoute } from '@tanstack/react-router'
import { WEB_UPDATE_LOG } from '~/constants/updateLog'
import { LogCard } from '~/components/ui/LogCard'

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
          <div className="flex items-center gap-3 mb-4">
            <div className="diamond-marker" />
            <span className="text-feldora-accent font-mono text-xs uppercase tracking-[0.3em]">Changelog</span>
            <div className="h-px flex-1 bg-gradient-to-r from-feldora-accent/30 to-transparent max-w-32" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight">
            Update <span className="text-feldora-accent">Log</span>
          </h1>
          <div className="mt-4 pl-4 border-l-2 border-feldora-accent/50 max-w-lg">
            <p className="text-feldora-text-secondary">
              Every iteration brings Feldora closer to its vision. Track the evolution.
            </p>
          </div>
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
