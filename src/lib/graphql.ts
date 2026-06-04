import { request, gql } from 'graphql-request'

const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPH_CMS_ENDPOINT as string

export interface Post {
  author: {
    name: string
    id: string
    bio: string
    photo?: { url: string }
  }
  createdAt: string
  updatedAt?: string
  slug: string
  title: string
  excerpt: string
  featuredImage: { url: string }
  category: Array<{ name: string; slug: string; color?: string }>
  content?: { raw: unknown; html: string }
}

export interface PostEdge {
  node: Post
}

export async function getPosts(): Promise<PostEdge[]> {
  if (!GRAPHQL_ENDPOINT) return []

  const query = gql`
    query GetPosts {
      postsConnection {
        edges {
          node {
            author {
              name
              id
              bio
            }
            createdAt
            slug
            title
            excerpt
            featuredImage {
              url
            }
            category {
              name
              slug
            }
          }
        }
      }
    }
  `
  const result = await request<{ postsConnection: { edges: PostEdge[] } }>(
    GRAPHQL_ENDPOINT,
    query
  )
  return result.postsConnection.edges
}

export interface PaginatedPostsResult {
  posts: Post[]
  hasNextPage: boolean
}

export async function getPostsPaginated(page: number, perPage: number = 12): Promise<PaginatedPostsResult> {
  if (!GRAPHQL_ENDPOINT) return { posts: [], hasNextPage: false }

  const skip = page * perPage

  const query = gql`
    query GetPostsPaginated($first: Int!, $skip: Int!) {
      postsConnection(first: $first, skip: $skip, orderBy: createdAt_DESC) {
        edges {
          node {
            author {
              name
              id
              bio
            }
            createdAt
            slug
            title
            excerpt
            featuredImage {
              url
            }
            category {
              name
              slug
            }
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `
  const result = await request<{
    postsConnection: { edges: PostEdge[]; pageInfo: { hasNextPage: boolean } }
  }>(GRAPHQL_ENDPOINT, query, { first: perPage, skip })

  return {
    posts: result.postsConnection.edges.map((edge) => edge.node),
    hasNextPage: result.postsConnection.pageInfo.hasNextPage,
  }
}

export async function getPostDetail(slug: string): Promise<Post | null> {
  if (!GRAPHQL_ENDPOINT) return null

  const query = gql`
    query GetPostDetail($slug: String!) {
      post(where: { slug: $slug }) {
        author {
          name
          id
          bio
          photo {
            url
          }
        }
        updatedAt
        createdAt
        slug
        title
        excerpt
        featuredImage {
          url
        }
        category {
          name
          slug
          color
        }
        content {
          raw
          html
        }
      }
    }
  `
  const result = await request<{ post: Post }>(GRAPHQL_ENDPOINT, query, { slug })
  return result.post
}
