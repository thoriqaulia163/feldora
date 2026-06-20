import { useState, useCallback } from 'react'
import { PageHeader } from '~/components/ui/PageHeader'
import { PLAYGROUND_COPY } from '~/constants/copy'
import { PLAYGROUND_MODULES } from './moduleRegistry'
import type { ModuleInstance, ModuleState, ModuleLabel } from './types'
import type { ComponentType } from 'react'

export function PlaygroundShell() {
  const [instances, setInstances] = useState<Record<string, ModuleInstance>>({})

  const updateModule = useCallback(
    (id: string, patch: Partial<ModuleInstance>) => {
      setInstances((prev) => ({
        ...prev,
        [id]: { ...prev[id], ...patch } as ModuleInstance,
      }))
    },
    []
  )

  const loadModule = useCallback(
    async (id: string) => {
      const moduleDef = PLAYGROUND_MODULES.find((m) => m.id === id)
      if (!moduleDef) return

      updateModule(id, {
        module: moduleDef,
        state: 'loading' as ModuleState,
        Component: null,
      })

      try {
        const imported = await moduleDef.load()
        updateModule(id, {
          module: moduleDef,
          state: 'ready' as ModuleState,
          Component: imported.default,
        })
      } catch (err) {
        updateModule(id, {
          module: moduleDef,
          state: 'error' as ModuleState,
          Component: null,
          error: err instanceof Error ? err.message : 'Failed to load module',
        })
      }
    },
    [updateModule]
  )

  const activeModule = Object.values(instances).find((i) => i.state === 'ready')

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Header */}
      <section className="relative px-6 md:px-12 lg:px-20 max-w-7xl mx-auto mb-16 overflow-hidden">
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

      {/* Module List or Active Module */}
      <section className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        {activeModule?.Component ? (
          <div>
            <button
              onClick={() => setInstances({})}
              className="inline-flex items-center gap-2 text-feldora-text-secondary text-sm hover:text-feldora-accent transition-colors duration-200 mb-8 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform duration-200">
                ←
              </span>
              Back to modules
            </button>
            <activeModule.Component />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLAYGROUND_MODULES.map((mod) => {
              const instance = instances[mod.id]
              const state: ModuleState = instance?.state ?? 'idle'

              return (
                <ModuleCard
                  key={mod.id}
                  name={mod.name}
                  description={mod.description}
                  label={mod.label}
                  lastUpdated={mod.lastUpdated}
                  size={mod.estimatedDownloadSize}
                  state={state}
                  error={instance?.error}
                  onLoad={() => loadModule(mod.id)}
                />
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function ModuleCard({
  name,
  description,
  label,
  lastUpdated,
  size,
  state,
  error,
  onLoad,
}: {
  name: string
  description: string
  label: ModuleLabel
  lastUpdated: string
  size: string
  state: ModuleState
  error?: string
  onLoad: () => void
}) {
  const labelColors: Record<ModuleLabel, string> = {
    AI: 'bg-feldora-accent/20 text-feldora-accent border-feldora-accent/30',
    Tool: 'bg-feldora-accent-secondary/20 text-feldora-accent-secondary border-feldora-accent-secondary/30',
    Game: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  }

  return (
    <div className="card-polygon p-6 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="diamond-marker !w-2 !h-2" />
          <h3 className="text-sm font-bold uppercase tracking-wider">{name}</h3>
        </div>
        <span className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 border ${labelColors[label]}`}>
          {label}
        </span>
      </div>
      <p className="text-feldora-text-secondary text-sm leading-relaxed mb-4 flex-1">
        {description}
      </p>
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-feldora-border/30">
        <div className="flex flex-col gap-1">
          <span className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider">
            {PLAYGROUND_COPY.moduleList.sizeLabel}: {size}
          </span>
          <span className="text-feldora-muted font-mono text-[10px] uppercase tracking-wider">
            Updated: {lastUpdated}
          </span>
        </div>
        {state === 'idle' && (
          <button onClick={onLoad} className="btn-angular-primary !px-4 !py-2 !text-[10px]">
            {PLAYGROUND_COPY.moduleList.loadButton}
          </button>
        )}
        {state === 'loading' && (
          <span className="text-feldora-accent font-mono text-[10px] uppercase tracking-wider animate-pulse-slow">
            {PLAYGROUND_COPY.moduleList.loadingButton}
          </span>
        )}
        {state === 'error' && (
          <div className="flex flex-col items-end gap-1">
            {error && (
              <span className="text-red-400 font-mono text-[9px]">{error}</span>
            )}
            <button onClick={onLoad} className="btn-angular-primary !px-4 !py-2 !text-[10px]">
              {PLAYGROUND_COPY.moduleList.errorRetry}
            </button>
          </div>
        )}
        {state === 'ready' && (
          <span className="text-green-400 font-mono text-[10px] uppercase tracking-wider">
            Ready
          </span>
        )}
      </div>
    </div>
  )
}
