import { useState, useEffect, useRef, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '~/components/ui/PageHeader'
import { SectionHeader } from '~/components/ui/SectionHeader'
import { LogCard } from '~/components/ui/LogCard'
import { Spinner } from '~/components/ui/Spinner'
import { ABOUT_COPY, LOG_COPY } from '~/constants/copy'
import { WEB_UPDATE_LOG } from '~/constants/updateLog'

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [{ title: 'FELDORA — About' }],
  }),
  component: AboutPage,
})

function AboutPage() {
  const [visibleCount, setVisibleCount] = useState(5)
  const [isLoading, setIsLoading] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)

  const hasMore = visibleCount < WEB_UPDATE_LOG.length
  const visibleEntries = WEB_UPDATE_LOG.slice(0, visibleCount)

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return
    setIsLoading(true)
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 5, WEB_UPDATE_LOG.length))
      setIsLoading(false)
    }, 300)
  }, [isLoading, hasMore])

  useEffect(() => {
    const el = observerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])
  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Header / Description */}
      <section className="relative px-6 md:px-12 lg:px-20 max-w-7xl mx-auto mb-20 overflow-hidden">
        <div className="absolute -right-40 top-0 w-[500px] h-[500px] border border-feldora-accent/[0.04] rotate-45 hidden lg:block" />
        <PageHeader
          label={ABOUT_COPY.header.label}
          title={<><span className="text-feldora-text">{ABOUT_COPY.header.heading}</span>{' '}<span className="text-feldora-accent">{ABOUT_COPY.header.headingAccent}</span></>}
        />

        {/* Creator pull-quote */}
        <div className="relative mt-10 mb-8 pl-6 md:pl-10">
          <span className="absolute left-0 -top-2 text-4xl md:text-5xl font-black text-feldora-accent-secondary/30 leading-none select-none">"</span>
          <p className="text-feldora-text text-base md:text-lg italic leading-relaxed max-w-2xl">
            {ABOUT_COPY.header.creator.quote}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-6 h-6 rotate-45 bg-feldora-accent-secondary/80 flex items-center justify-center">
              <span className="text-[8px] font-black text-white -rotate-45">F</span>
            </div>
            <span className="text-feldora-accent-secondary font-mono text-[10px] uppercase tracking-wider">
              {ABOUT_COPY.header.creator.name}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="pl-4 border-l-2 border-feldora-accent-secondary/50 max-w-2xl">
          <p className="text-feldora-text-secondary text-lg leading-relaxed">
            {ABOUT_COPY.header.description}
          </p>
        </div>
      </section>

      {/* Design & Architecture Philosophy */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-feldora-surface/30 -skew-y-1" />
        <div className="absolute top-0 left-0 w-1/3 h-[2px] bg-gradient-to-r from-feldora-accent/40 to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/4 h-[2px] bg-gradient-to-l from-feldora-accent-secondary/20 to-transparent" />
        <div className="relative px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
          <div className="mb-10">
            <SectionHeader
              label={ABOUT_COPY.designPhilosophy.label}
              heading={ABOUT_COPY.designPhilosophy.heading}
              headingAccent={ABOUT_COPY.designPhilosophy.headingAccent}
              headingSize="text-3xl md:text-4xl"
              trailing={
                <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-feldora-border to-transparent" />
              }
            />
          </div>
          <div className="grid md:grid-cols-[3px_1fr] gap-6">
            {/* Vertical accent line */}
            <div className="hidden md:block bg-gradient-to-b from-feldora-accent via-feldora-accent-secondary/40 to-transparent rounded-full" />
            <div className="space-y-5">
              {ABOUT_COPY.designPhilosophy.paragraphs.map((p, i) => (
                <div key={i} className="group relative pl-5 md:pl-0">
                  <div className="absolute left-0 top-2 w-2 h-2 rotate-45 bg-feldora-accent/60 md:hidden" />
                  <p className="text-feldora-text-secondary leading-relaxed" dangerouslySetInnerHTML={{ __html: boldify(p) }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Development Philosophy */}
      <section className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto py-20">
        <div className="mb-10">
          <SectionHeader
            label={ABOUT_COPY.developmentPhilosophy.label}
            heading={ABOUT_COPY.developmentPhilosophy.heading}
            headingAccent={ABOUT_COPY.developmentPhilosophy.headingAccent}
            headingSize="text-3xl md:text-4xl"
            trailing={
              <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-feldora-border to-transparent" />
            }
          />
        </div>
        <div className="space-y-4">
          {ABOUT_COPY.developmentPhilosophy.paragraphs.map((p, i) => (
            <div key={i} className="panel-frame p-6 md:p-8 bg-feldora-surface/50 group hover:border-feldora-accent/30 transition-colors duration-300">
              <div className="flex items-start gap-4">
                <div className="hex-badge w-8 h-8 shrink-0 text-[10px] font-bold text-white">
                  {i + 1}
                </div>
                <p className="text-feldora-text-secondary leading-relaxed" dangerouslySetInnerHTML={{ __html: boldify(p) }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Update Log */}
      <section id="log" className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto py-20">
        <div className="mb-10">
          <SectionHeader
            label={LOG_COPY.header.label}
            heading={LOG_COPY.header.heading}
            headingAccent={LOG_COPY.header.headingAccent}
            headingSize="text-3xl md:text-4xl"
            trailing={
              <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-feldora-border to-transparent" />
            }
          />
        </div>

        <div className="relative space-y-3">
          <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-feldora-accent/40 via-feldora-border/30 to-transparent" />

          {visibleEntries.map((entry, index) => (
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

        {/* Infinite scroll trigger */}
        <div ref={observerRef} className="mt-8 flex justify-center py-4">
          {(hasMore || isLoading) && <Spinner />}
          {!hasMore && !isLoading && (
            <p className="text-feldora-muted font-mono text-xs uppercase tracking-wider">
              All updates loaded
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

/**
 * Converts text wrapped in **double asterisks** to <strong> tags.
 */
function boldify(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-feldora-text font-semibold">$1</strong>')
}
