import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { getPosts, getPostDetail, getPostsPaginated } from './graphql'

export function useGetPosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

export function useGetPostsPaginated(perPage: number = 12) {
  return useInfiniteQuery({
    queryKey: ['posts-paginated', perPage],
    queryFn: ({ pageParam = 0 }) => getPostsPaginated(pageParam, perPage),
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
