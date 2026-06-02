import { useQuery } from '@tanstack/react-query'
import { getPosts, getPostDetail } from './graphql'

export function useGetPosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

export function useGetPostDetail(slug: string) {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: () => getPostDetail(slug),
    enabled: !!slug,
  })
}
