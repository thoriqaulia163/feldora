import { PLAYGROUND_MODULES } from '~/components/playground/moduleRegistry'

/**
 * Hero carousel configuration.
 * Change `highlightedModuleId` to feature a different playground module.
 */

const HIGHLIGHTED_MODULE_ID = 'local-weather-forecast'

export const HERO_CAROUSEL_CONFIG = {
  /** Slides in display order */
  slides: [
    { id: 'intro' as const },
    { id: 'playground' as const },
    { id: 'story' as const },
    { id: 'about' as const },
  ],

  /** The playground module to highlight in slide 2 */
  highlightedModule: PLAYGROUND_MODULES.find((m) => m.id === HIGHLIGHTED_MODULE_ID) ?? PLAYGROUND_MODULES[0],
}
