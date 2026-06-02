import { createFileRoute } from '@tanstack/react-router'
import { StoryList } from '~/components/story/StoryList'

export const Route = createFileRoute('/story/')({
  head: () => ({
    meta: [{ title: 'FELDORA — Stories' }],
  }),
  component: StoryIndexPage,
})

function StoryIndexPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <section className="relative px-6 md:px-12 lg:px-20 max-w-7xl mx-auto mb-20">
        <div className="absolute -right-20 top-10 w-[300px] h-[2px] bg-feldora-accent/10 rotate-[-25deg] hidden lg:block" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="diamond-marker" />
            <span className="text-feldora-accent font-mono text-xs uppercase tracking-[0.3em]">Stories</span>
            <div className="h-px flex-1 bg-gradient-to-r from-feldora-accent/30 to-transparent max-w-32" />
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[0.85]">
            <span className="text-feldora-text">Read.</span>{' '}
            <span className="text-feldora-accent">Discover.</span>
          </h1>
          <div className="mt-6 pl-4 border-l-2 border-feldora-accent/50 max-w-xl">
            <p className="text-feldora-text-secondary text-lg">
              Narratives from the digital frontier. Technology, creativity, and the
              stories that shape our craft.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <StoryList />
      </section>
    </div>
  )
}
