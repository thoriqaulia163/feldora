export type ModuleState = 'idle' | 'loading' | 'ready' | 'error'

export type ModuleLabel = 'AI' | 'Tool' | 'Game'

export interface PlaygroundModule {
  id: string
  name: string
  description: string
  label: ModuleLabel
  lastUpdated: string
  estimatedDownloadSize: string
  cacheCheckUrl?: string
}
