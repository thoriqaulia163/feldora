import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { getPosts, getPostDetail } from './graphql'
import { getMockPostsPaginated } from './mockPosts'

export function useGetPosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

export function useGetPostsPaginated() {
  return useInfiniteQuery({
    queryKey: ['posts-paginated'],
    queryFn: ({ pageParam = 0 }) => getMockPostsPaginated(pageParam, 12),
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.hasNextPage ? (lastPageParam as number) + 1 : undefined,
    initialPageParam: 0,
    staleTime: 1000 * 60 * 60,
  })
}

export function useGetPostDetail(slug: string) {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: () => getPostDetail(slug),
    enabled: !!slug,
  })
}
