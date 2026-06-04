import { useEffect, useRef, useMemo } from 'react'
import { useGetPostsPaginated } from '~/lib/queries'
import { SkeletonCardGrid } from '~/components/ui/Skeleton'
import { ErrorState } from '~/components/ui/ErrorState'
import { Spinner } from '~/components/ui/Spinner'
import { StoryCard } from '~/components/story/StoryCard'
import { STORY_COPY } from '~/constants/copy'

export function StoryList() {
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetPostsPaginated()

  const observerRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const el = observerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const allPosts = useMemo(
    () => data?.pages.flatMap((page) => page.posts) ?? [],
    [data]
  )

  if (isPending) {
    return <SkeletonCardGrid count={12} />
  }

  if (isError) {
    return (
      <ErrorState
        title={STORY_COPY.error.title}
        onRetry={() => refetch()}
      />
    )
  }

  if (allPosts.length === 0) {
    return (
      <ErrorState
        label={STORY_COPY.error.empty.label}
        title={STORY_COPY.error.empty.title}
        message={STORY_COPY.error.empty.message}
      />
    )
  }

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {allPosts.map((story) => (
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

      {/* Infinite scroll trigger */}
      <div ref={observerRef} className="mt-8 flex justify-center py-4">
        {isFetchingNextPage && (
          <Spinner />
        )}
        {!hasNextPage && allPosts.length > 0 && (
          <p className="text-feldora-muted font-mono text-xs uppercase tracking-wider">
            All stories loaded
          </p>
        )}
      </div>
    </>
  )
}
