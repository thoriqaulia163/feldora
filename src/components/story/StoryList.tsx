import { useGetPosts } from '~/lib/queries'
import { SkeletonCardGrid } from '~/components/ui/Skeleton'
import { ErrorState } from '~/components/ui/ErrorState'
import { StoryCard } from '~/components/story/StoryCard'
import { STORY_COPY } from '~/constants/copy'

export function StoryList() {
  const { data: posts, isPending, isError, refetch } = useGetPosts()

  if (isPending) {
    return <SkeletonCardGrid count={3} />
  }

  if (isError) {
    return (
      <ErrorState
        title={STORY_COPY.error.title}
        onRetry={() => refetch()}
      />
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <ErrorState
        label={STORY_COPY.error.empty.label}
        title={STORY_COPY.error.empty.title}
        message={STORY_COPY.error.empty.message}
      />
    )
  }

  const stories = posts.map((edge) => edge.node)

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {stories.map((story) => (
        <StoryCard
          key={story.slug}
          slug={story.slug}
          title={story.title}
          excerpt={story.excerpt}
          createdAt={story.createdAt}
          imageUrl={story.featuredImage.url}
          category={story.category?.[0]?.name}
        />
      ))}
    </div>
  )
}
