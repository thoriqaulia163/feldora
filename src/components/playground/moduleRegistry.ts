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
    deviceSupport: { desktop: 'smooth', mobile: 'smooth' },
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
    deviceSupport: { desktop: 'smooth', mobile: 'smooth' },
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
    deviceSupport: { desktop: 'smooth', mobile: 'smooth' },
  },
  {
    id: 'ai-upscaler',
    name: 'Advanced Image Upscaler',
    description:
      'AI-powered 4× image upscaling using Real-ESRGAN x4v3. Runs entirely in-browser via LiteRT.js (WebGPU or WASM). Model ~4 MB + runtime ~9 MB — downloaded once, cached offline.',
    label: 'AI',
    lastUpdated: '18 July 2026',
    estimatedDownloadSize: '~13 MB',
    cacheCheckUrl: '/ai-models/ai-upscaler/model.tflite',
    // WebGPU not available on most mobile browsers → WASM CPU fallback (5–15 min per image)
    deviceSupport: { desktop: 'smooth', mobile: 'limited' },
  },
  {
    id: 'quick-upscaler',
    name: 'Quick Image Upscaler',
    description:
      'In-browser image upscaling via Bicubic, Lanczos3, FSR1 (Edge-Adaptive), or EWA Jinc. WebGPU-accelerated — no downloads, no API calls.',
    label: 'Tool',
    lastUpdated: '30 June 2026',
    estimatedDownloadSize: '< 5 KB',
    // GPU algorithms unavailable on mobile (WebGPU browser support), but Bicubic runs smoothly
    deviceSupport: { desktop: 'smooth', mobile: 'limited' },
  },
  {
    id: 'tic-tac-toe',
    name: 'Tic Tac Toe',
    description:
      'Classic 3×3 strategy game. Play PvP (two players on one device) or PvC against a bot with three difficulty levels — Easy, Medium, and unbeatable Hard (Minimax).',
    label: 'Game',
    lastUpdated: '30 June 2026',
    estimatedDownloadSize: '< 10 KB',
    deviceSupport: { desktop: 'smooth', mobile: 'smooth' },
  },
  {
    id: 'split-bill',
    name: 'Split Bill',
    description: 'Fully offline bill splitting with encrypted storage. Supports equal, custom, and itemized split modes. PIN-protectable.',
    label: 'Tool',
    lastUpdated: '23 June 2026',
    estimatedDownloadSize: '~150 KB',
    deviceSupport: { desktop: 'smooth', mobile: 'smooth' },
  },
]
