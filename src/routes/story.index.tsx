import { createFileRoute } from '@tanstack/react-router'
import { StoryList } from '~/components/story/StoryList'
import { PageHeader } from '~/components/ui/PageHeader'
import { STORY_COPY } from '~/constants/copy'

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
          label={STORY_COPY.header.label}
          title={<><span className="text-feldora-text">{STORY_COPY.header.heading}</span>{' '}<span className="text-feldora-accent">{STORY_COPY.header.headingAccent}</span></>}
          description={STORY_COPY.header.description}
        />
      </section>

      <section className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <StoryList />
      </section>
    </div>
  )
}
