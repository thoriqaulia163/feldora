import { PLACEHOLDER_STORIES } from '~/constants/placeholderStories'
import { StoryCard } from '~/components/story/StoryCard'
import { SectionHeader } from '~/components/ui/SectionHeader'
import { HOME_COPY } from '~/constants/copy'

export function FeaturedSection() {
  return (
    <section className="relative py-28 px-6 md:px-12 lg:px-20 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-feldora-accent/30 to-transparent" />
      <div className="absolute -right-40 top-20 w-[500px] h-[2px] bg-feldora-accent/10 rotate-[-35deg]" />
      <div className="absolute -left-40 bottom-40 w-[400px] h-[2px] bg-feldora-accent/10 rotate-[25deg]" />

      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <SectionHeader
            label={HOME_COPY.featured.label}
            heading={HOME_COPY.featured.heading}
            headingAccent={HOME_COPY.featured.headingAccent}
            headingSize="text-4xl md:text-6xl"
            trailing={
              <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-feldora-border to-transparent" />
            }
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {PLACEHOLDER_STORIES.map((story) => (
            <StoryCard
              key={story.slug}
              slug={story.slug}
              title={story.title}
              excerpt={story.excerpt}
              createdAt={story.createdAt}
              imageUrl={story.featuredImage.url}
              category={story.category[0]?.name}
              showDate={false}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
