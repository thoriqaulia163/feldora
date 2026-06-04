import { createFileRoute } from '@tanstack/react-router'
import { StoryList } from '~/components/story/StoryList'
import { PageHeader } from '~/components/ui/PageHeader'

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
        <PageHeader
          label="Stories"
          title={<><span className="text-feldora-text">Read.</span>{' '}<span className="text-feldora-accent">Discover.</span></>}
          description="Narratives from the digital frontier. Technology, creativity, and the stories that shape our craft."
        />
      </section>

      <section className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <StoryList />
      </section>
    </div>
  )
}
