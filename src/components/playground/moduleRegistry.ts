import type { PlaygroundModule } from './types'

export const PLAYGROUND_MODULES: PlaygroundModule[] = [
  {
    id: 'local-weather-forecast',
    name: 'Local Weather Forecast',
    description:
      'Offline rain prediction for 514 Indonesian cities using a pre-trained Random Forest model (40 trees, depth 6). No API calls — runs entirely in-browser.',
    label: 'AI',
    lastUpdated: '20 June 2026',
    estimatedDownloadSize: '~130 KB',
    load: () => import('./modules/weather/WeatherModule.js'),
  },
]
