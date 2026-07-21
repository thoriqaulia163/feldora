export type ModuleState = 'idle' | 'loading' | 'ready' | 'error'

export type ModuleLabel = 'AI' | 'Tool' | 'Game'

/**
 * Device compatibility for a playground module.
 *   smooth     — runs without caveats
 *   limited    — runs but with browser/hardware limitations
 *   unsupported — does not work on this device class
 */
export type DeviceCompatibility = 'smooth' | 'limited' | 'unsupported'

/** Required for every module in moduleRegistry.ts */
export interface DeviceSupportSpec {
  desktop: DeviceCompatibility
  mobile: DeviceCompatibility
}

export interface PlaygroundModule {
  id: string
  name: string
  description: string
  label: ModuleLabel
  lastUpdated: string
  estimatedDownloadSize: string
  cacheCheckUrl?: string
  /** Device compatibility — required field for all modules */
  deviceSupport: DeviceSupportSpec
}
