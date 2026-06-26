import type { PlaygroundModule } from './types'

export const PLAYGROUND_MODULES: PlaygroundModule[] = [
  {
    id: 'local-weather-forecast',
    name: 'Local Weather Forecast',
    description:
      'Offline rain prediction for 287 Indonesian cities using a pre-trained Random Forest model (40 trees, depth 6). No API calls — runs entirely in-browser.',
    label: 'AI',
    lastUpdated: '20 June 2026',
    estimatedDownloadSize: '~130 KB',
    cacheCheckUrl: '/ai-models/local-weather-forecast/model.json',
  },
  {
    id: 'local-weather-forecast-v2',
    name: 'Local Weather Forecast V2',
    description:
      'Per-slot rain prediction (morning/afternoon/evening/night) for 287 Indonesian cities. 4 independent Random Forests with weather persistence feature — fully offline.',
    label: 'AI',
    lastUpdated: '22 June 2026',
    estimatedDownloadSize: '~420 KB',
    cacheCheckUrl: '/ai-models/local-weather-forecast-v2/model.json',
  },
  {
    id: 'local-weather-forecast-v2-5',
    name: 'Local Weather Forecast V2.5',
    description:
      'Per-slot rain prediction using Gradient Boosted Trees with computed climate features. Improved accuracy over V2 — fully offline.',
    label: 'AI',
    lastUpdated: '23 June 2026',
    estimatedDownloadSize: '~320 KB',
    cacheCheckUrl: '/ai-models/local-weather-forecast-v2-5/model.json',
  },
  {
    id: 'tic-tac-toe',
    name: 'Tic Tac Toe',
    description: 'Coming soon',
    label: 'Game',
    lastUpdated: '-',
    estimatedDownloadSize: '-',
  },
  {
    id: 'split-bill',
    name: 'Split Bill',
    description: 'Fully offline bill splitting with encrypted storage. Supports equal, custom, and itemized split modes. PIN-protectable.',
    label: 'Tool',
    lastUpdated: '23 June 2026',
    estimatedDownloadSize: '~150 KB',
  },
]
