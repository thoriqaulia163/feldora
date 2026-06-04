import { useGetPosts } from '~/lib/queries'
import { SkeletonCardGrid } from '~/components/ui/Skeleton'
import { ErrorState } from '~/components/ui/ErrorState'
import { StoryCard } from '~/components/story/StoryCard'

export function StoryList() {
  const { data: posts, isPending, isError, refetch } = useGetPosts()

  if (isPending) {
    return <SkeletonCardGrid count={3} />
  }

  if (isError) {
    return (
      <ErrorState
        title="Gagal memuat cerita"
        onRetry={() => refetch()}
      />
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <ErrorState
        label="No Stories"
        title="Belum ada cerita"
        message="Cerita baru akan segera hadir."
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
