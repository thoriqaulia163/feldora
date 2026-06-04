export const STORY_COPY = {
  header: {
    label: 'Stories',
    heading: 'Read.',
    headingAccent: 'Discover.',
    description: 'Narratives from the digital frontier. Technology, creativity, and the stories that shape our craft.',
  },
  error: {
    title: 'Gagal memuat cerita',
    empty: {
      label: 'No Stories',
      title: 'Belum ada cerita',
      message: 'Cerita baru akan segera hadir.',
    },
  },
  detail: {
    backLink: 'Back to Stories',
    backLinkAll: 'Back to all stories',
    error: {
      title: 'Gagal memuat artikel',
    },
    notFound: {
      code: '404',
      title: 'Story Not Found',
      message: "This story doesn't exist or has been removed.",
      cta: 'Back to Stories',
    },
  },
} as const
