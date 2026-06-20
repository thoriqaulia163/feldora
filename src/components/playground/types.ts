import type { ComponentType } from 'react'

export type ModuleState = 'idle' | 'loading' | 'ready' | 'error'

export type ModuleLabel = 'AI' | 'Tool' | 'Game'

export interface PlaygroundModule {
  id: string
  name: string
  description: string
  label: ModuleLabel
  lastUpdated: string
  estimatedDownloadSize: string
  load: () => Promise<{ default: ComponentType }>
}

export interface ModuleInstance {
  module: PlaygroundModule
  state: ModuleState
  Component: ComponentType | null
  error?: string
}
