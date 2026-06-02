export interface UpdateEntry {
  tanggal: string
  update: string
}

export const WEB_UPDATE_LOG: UpdateEntry[] = [
  {
    tanggal: '2 June 2026',
    update: '[MAJOR] Complete rebuild with TanStack Start + TypeScript + cinematic design system',
  },
  {
    tanggal: '18 September 2025',
    update: 'Installing new fonts + change update log data to constant',
  },
  {
    tanggal: '9 Februari 2025',
    update: 'Update post-body-content',
  },
  {
    tanggal: '9 Februari 2025',
    update: 'Fixing Loading and Vercel go-to-specific-routes bug',
  },
  {
    tanggal: '8 Februari 2025',
    update: 'Fixing post page layout, body-content-HTML, and post card',
  },
  {
    tanggal: '8 Februari 2025',
    update: 'Revamp UI, styling, and layout. Add log. Add new webLogo. Add page animation. Implement React-helmet',
  },
  {
    tanggal: '2 Agustus 2024',
    update: 'Implement GetPost and post page using React Query and GraphQL',
  },
  {
    tanggal: '22 Juli 2024',
    update: 'Initialize React Query',
  },
  {
    tanggal: '9 Juli 2024',
    update: 'Initialize Project',
  },
]
