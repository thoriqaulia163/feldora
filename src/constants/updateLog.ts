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
    description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do',
  },
  {
    date: '18 September 2025',
    title: 'Installing new fonts + change update log data',
    status: 'minor',
    type: 'refactor',
    version: '0.4.3',
    description: 'Installing new fonts for better visual * change update log data to constant',
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
