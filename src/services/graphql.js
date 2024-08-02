import {request, gql} from 'graphql-request';

const graphqlAPI = import.meta.env.VITE_GRAPH_CMS_ENDPOINT

export const getPosts = async () =>{
  const query = gql`
  query MyQuery {
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
  const result = await request(graphqlAPI, query)
  return result.postsConnection.edges;
}

export const getPostDetail = async (slug) =>{
  const query = gql`
  query GetPostDetail($slug: String!) {
    post(where: {slug: $slug}){
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
      content {
        raw
        html
      }
    }
  }
  `
  const result = await request(graphqlAPI, query, { slug })
  return result.post;
}