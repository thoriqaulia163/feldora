export type UpdateStatus = 'minor' | 'moderate' | 'major'
export type UpdateCategory = 'update' | 'fixing' | 'refactor' | 'revamp'

export interface UpdateEntry {
  date: string
  title: string
  status: UpdateStatus
  type: UpdateCategory
  version: string
  description: string
}

export const WEB_UPDATE_LOG: UpdateEntry[] = [
  {
    date: '5 June 2026',
    title: 'Dual-tone accent (purple & orange) + SectionHeader component',
    status: 'moderate',
    type: 'revamp',
    version: '1.5.0',
    description: 'Switched accent color scheme from red (#dc2626) to dual-tone purple (#8b5cf6) + orange (#f97316). Purple used for interactive elements (buttons, hover borders, heading highlights), orange for decorative/marker elements (diamond markers, hex badges, labels, category tags, logo bar, panel frame corners, navbar active indicator). Created reusable SectionHeader component (label + heading + headingAccent + trailing) and applied it to FeaturedSection, LatestUpdates, and About values section. Restructured ABOUT_COPY.values to include header metadata (label, heading, headingAccent, items). Renamed PWA icons to feldora-logo-192.png and feldora-logo-512.png, updated manifest.json and favicon reference in __root.tsx.',
  },
  {
    date: '4 June 2026',
    title: 'New icon',
    status: 'minor',
    type: 'revamp',
    version: '1.4.1',
    description: 'Replaced webp logo with proper PNG icons (192x192 and 512x512) for PWA manifest and browser favicon compatibility across all devices.',
  },
  {
    date: '4 June 2026',
    title: 'Infinite scroll on StoryList & Spinner component',
    status: 'moderate',
    type: 'update',
    version: '1.4.0',
    description: 'Implemented infinite scroll on StoryList using useInfiniteQuery with IntersectionObserver. Fetches 12 posts per page via Hygraph GraphQL paginated query (first/skip/pageInfo.hasNextPage). Created reusable Spinner component with configurable size. Added mock API (36 posts, 800ms delay) for future testing. Used useMemo for flattened posts array to avoid unnecessary recalculations on every render.',
  },
  {
    date: '4 June 2026',
    title: 'Centralize copywriting to dedicated directory',
    status: 'minor',
    type: 'refactor',
    version: '1.3.2',
    description: 'Moved all hardcoded text/copy from components into src/constants/copy/ directory with separate files per page (home.ts, about.ts, log.ts, story.ts). Components now import text from centralized copy files, making content changes easier without touching UI code.',
  },
  {
    date: '4 June 2026',
    title: 'Fixing UI & Refactor Code',
    status: 'minor',
    type: 'fixing',
    version: '1.3.1',
    description: 'Extracted StoryCard as reusable component shared between FeaturedSection and StoryList. Fixed mobile horizontal scroll on log page by moving tooltip to left side and adding overflow-hidden on LogCard. Replaced broken placeholder image. Made FeaturedSection cards clickable with navigation to story detail. Extracted NotFoundPage to separate component. Disabled service worker registration on localhost for smoother development. Added development orientation principles to DESIGN_SYSTEM.md. Created reusable PageHeader component and applied it to About, Log, and Story pages.',
  },
  {
    date: '4 June 2026',
    title: 'Error & Loading State handling',
    status: 'moderate',
    type: 'update',
    version: '1.3.0',
    description: 'Implemented comprehensive error and loading state system: GlobalLoader (red loading bar on route transition), reusable Skeleton components (card, article, grid), ErrorState reusable component with retry/back actions, global ErrorPage boundary for runtime crashes, OfflineBanner (dismissible notification at top-right), Toast notification system (success/error/warning/info with auto-dismiss). Also refactored StoryList to show proper error/empty states and StoryDetail to fallback to placeholder data or show error UI.',
  },
  {
    date: '4 June 2026',
    title: 'Implement PWA with offline support',
    status: 'moderate',
    type: 'update',
    version: '1.2.0',
    description: 'Added Progressive Web App support: manifest.json for installability (standalone display, dark theme), service worker with network-first caching strategy for offline access, custom offline.html fallback page styled with Feldora design system, and precaching of essential routes. App is now installable on mobile and desktop.',
  },
  {
    date: '4 June 2026',
    title: 'Revamp Update Log system & add LogCard component',
    status: 'moderate',
    type: 'revamp',
    version: '1.1.0',
    description: 'Restructured WEB_UPDATE_LOG data with new fields: status (minor/moderate/major), type (update/fixing/refactor/revamp), version, and description. Renamed tanggal to date, update to title. Created reusable LogCard component with accordion expand for description, color-coded status badges, category type icons (circle-up green for update, wrench-screwdriver red for fixing, broom orange for refactor, sparkles blue for revamp) with hover tooltips, version display below date, and responsive mobile layout where status & type shift to the right. Updated LatestUpdates (home) and Log page to use the shared component.',
  },
  {
    date: '2 June 2026',
    title: 'Complete rebuild with TanStack Start + TypeScript + cinematic design system',
    status: 'major',
    type: 'refactor',
    version: '1.0.0',
    description: 'Complete platform migration from React SPA to TanStack Start with SSR, file-based routing, and Nitro for Vercel deployment. Implemented cinematic dark-only design system inspired by Riot Games — angular geometry, bold typography (Inter + JetBrains Mono), and CSS-only animations. Built with development orientations: security & privacy (env vars protected, least-privilege), high performance & lightweight (SSR, minimal deps, no runtime animation libs), modular & scalable (reusable components, structured folder architecture), and maintainable & fixable (TypeScript strict, DESIGN_SYSTEM.md as source of truth, clear separation of concerns).',
  },
  {
    date: '18 September 2025',
    title: 'Installing new fonts + change update log data to constant',
    status: 'minor',
    type: 'update',
    version: '0.4.3',
    description: 'Added custom fonts (Inter, JetBrains Mono) and migrated update log data from inline to a dedicated constants file for better maintainability.',
  },
  {
    date: '9 Februari 2025',
    title: 'Update post-body-content',
    status: 'minor',
    type: 'update',
    version: '0.4.2',
    description: 'update post page formating',
  },
  {
    date: '9 Februari 2025',
    title: 'Fixing Loading and Vercel go-to-specific-routes bug',
    status: 'minor',
    type: 'fixing',
    version: '0.4.1',
    description: 'fixing vercel configuration for routing',
  },
  {
    date: '8 Februari 2025',
    title: 'Fixing post page layout, body-content-HTML, and post card',
    status: 'moderate',
    type: 'fixing',
    version: '0.4.0',
    description: 'fixing format in post page, so it match data from rich-text-editor',
  },
  {
    date: '8 Februari 2025',
    title: 'Add Update log & Implement React-helmet',
    status: 'moderate',
    type: 'update',
    version: '0.3.0',
    description: 'Add log page for tracking website update and implement react-helmet for async title',
  },
  {
    date: '8 Februari 2025',
    title: 'Revamp UI, styling, and layout. Add new webLogo & page animation',
    status: 'minor',
    type: 'refactor',
    version: '0.2.1',
    description: 'Revamp UI & Layout and add Add log. Add new webLogo of Feldora and page animation.',
  },
  {
    date: '2 Agustus 2024',
    title: 'Implement GetPost and post page using React Query and GraphQL',
    status: 'moderate',
    type: 'update',
    version: '0.2.0',
    description: 'Integrate React-Query with api from GraphQL (Hygraph)',
  },
  {
    date: '22 Juli 2024',
    title: 'Initialize React Query',
    status: 'moderate',
    type: 'update',
    version: '0.1.0',
    description: 'Install and setup React-Query in the project. Set rules & standard for development',
  },
  {
    date: '9 Juli 2024',
    title: 'Initialize Project',
    status: 'major',
    type: 'update',
    version: '0.0.0',
    description: 'Initializing Feldora Project and Setup. Created with Vite + React. Plan to use react-query as data fetching & state maintainers',
  },
]
