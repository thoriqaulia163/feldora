import { useState, useEffect } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '~/components/ui/PageHeader'
import { PLAYGROUND_COPY } from '~/constants/copy'
import { PLAYGROUND_MODULES } from '~/components/playground/moduleRegistry'
import type { PlaygroundModule, ModuleLabel, DeviceCompatibility } from '~/components/playground/types'

export const Route = createFileRoute('/playground/')({
  head: () => ({
    meta: [{ title: 'FELDORA — Playground' }],
  }),
  component: PlaygroundIndex,
})

function PlaygroundIndex() {
  const [search, setSearch] = useState('')

  const filtered = PLAYGROUND_MODULES.filter(
    (mod) =>
      mod.name.toLowerCase().includes(search.toLowerCase()) ||
      mod.description.toLowerCase().includes(search.toLowerCase()) ||
      mod.label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Header */}
      <section className="relative px-6 md:px-12 lg:px-20 max-w-7xl mx-auto mb-12 overflow-hidden">
        <div className="absolute -right-40 top-0 w-[500px] h-[500px] border border-feldora-accent/[0.04] rotate-45 hidden lg:block" />
        <PageHeader
          label={PLAYGROUND_COPY.header.label}
          title={
            <>
              <span className="text-feldora-text">{PLAYGROUND_COPY.header.heading}</span>{' '}
              <span className="text-feldora-accent">{PLAYGROUND_COPY.header.headingAccent}</span>
            </>
          }
          description={PLAYGROUND_COPY.header.description}
        />
      </section>

      {/* Search */}
      <section className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto mb-8">
        <div className="relative w-full">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-feldora-muted" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={PLAYGROUND_COPY.moduleList.searchPlaceholder}            className="w-full bg-feldora-surface-light border border-feldora-border/50 text-feldora-text text-sm pl-10 pr-4 py-2.5 focus:outline-none focus:border-feldora-accent/60 transition-colors"
          />
        </div>
        <p className="mt-3 text-feldora-muted text-xs">
          {PLAYGROUND_COPY.moduleList.offlineHint}
        </p>
      </section>

      {/* Module Grid */}
      <section className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-feldora-muted font-mono text-xs uppercase tracking-wider">
              {PLAYGROUND_COPY.moduleList.noModulesFound}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((mod) => (
              <ModuleCard key={mod.id} module={mod} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

const DC = PLAYGROUND_COPY.moduleList.deviceSupport

const deviceBadgeStyles: Record<DeviceCompatibility, { icon: string; color: string; border: string }> = {
  smooth:      { icon: '✓', color: 'text-emerald-400', border: 'border-emerald-500/30 bg-emerald-500/5' },
  limited:     { icon: '⚠', color: 'text-amber-400',   border: 'border-amber-500/30 bg-amber-500/5' },
  unsupported: { icon: '✗', color: 'text-feldora-muted', border: 'border-feldora-border/30 bg-feldora-surface-light' },
}

function DeviceBadge({ compat, label, device }: { compat: DeviceCompatibility; label: string; device: 'desktop' | 'mobile' }) {
  const { icon, color, border } = deviceBadgeStyles[compat]
  const tooltipKey = `${device}_${compat}` as keyof typeof DC.tooltips
  return (
    <span
      title={DC.tooltips[tooltipKey]}
      className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider border px-2 py-0.5 cursor-default ${color} ${border}`}
    >
      <span className="text-sm mb-1 leading-none">{icon}</span>
      <span>{label}</span>
    </span>
  )
}

function ModuleCard({ module: mod }: { module: PlaygroundModule }) {
  const [offlineReady, setOfflineReady] = useState(false)

  useEffect(() => {
    if (mod.cacheCheckUrl && 'caches' in window) {
      caches.match(mod.cacheCheckUrl).then((res) => {
        setOfflineReady(!!res)
      }).catch(() => {})
    }
  }, [mod.cacheCheckUrl])

  const labelColors: Record<ModuleLabel, string> = {
    AI: 'bg-feldora-accent/20 text-feldora-accent border-feldora-accent/30',
    Tool: 'bg-amber-400/20 text-amber-400 border-amber-400/30',
    Game: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  }

  return (
    <Link
      to={`/playground/${mod.id}` as '/playground/local-weather-forecast' | '/playground/local-weather-forecast-v2' | '/playground/local-weather-forecast-v2-5' | '/playground/split-bill' | '/playground/tic-tac-toe' | '/playground/quick-upscaler' | '/playground/ai-upscaler'}
      className="card-polygon p-6 flex flex-col hover:border-feldora-accent/40 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="diamond-marker !w-2 !h-2" />
          <h3 className="text-sm font-bold uppercase tracking-wider">{mod.name}</h3>
        </div>
        <span className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 border ${labelColors[mod.label]}`}>
          {mod.label}
        </span>
      </div>
      <p className="text-feldora-text-secondary text-sm leading-relaxed mb-4 flex-1">
        {mod.description}
      </p>
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-feldora-border/30">
        <div className="flex flex-col gap-1">
          <span className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider">
            {PLAYGROUND_COPY.moduleList.sizeLabel}: {mod.estimatedDownloadSize}
          </span>
          <span className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider">
            {PLAYGROUND_COPY.moduleList.updatedLabel} {mod.lastUpdated}
          </span>
        </div>
        {offlineReady ? (
          <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            {PLAYGROUND_COPY.moduleList.offlineReadyBadge}
          </span>
        ) : (
          <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 border bg-feldora-surface-light text-feldora-muted border-feldora-border/30">
            {PLAYGROUND_COPY.moduleList.notLoadedBadge}
          </span>
        )}
      </div>

      {/* Device compatibility */}
      <div className="flex items-center gap-3 pt-3 border-t border-feldora-border/20 mt-2">
        <DeviceBadge compat={mod.deviceSupport.desktop} label={DC.desktopLabel} device="desktop" />
        <DeviceBadge compat={mod.deviceSupport.mobile}  label={DC.mobileLabel}  device="mobile" />
      </div>
    </Link>
  )
}
