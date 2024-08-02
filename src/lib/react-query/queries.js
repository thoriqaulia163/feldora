import { useQuery,useMutation,useQueryClient,useInfiniteQuery, } from '@tanstack/react-query';
import { getPosts,getPostDetail } from '@services/graphql';


export const useGetPosts = () =>{
  return useQuery({
      queryKey: ['fetchPosts'],
      queryFn: async () => {
          const res = await getPosts()
          return res
      },
      staleTime:3600000
  })
}

export const useGetPostDetail = ({ slug }) => {
  return useQuery({
      queryKey: ['fetchPostDetail'],
      queryFn: () => getPostDetail(slug),
      gcTime:0,
  })
}