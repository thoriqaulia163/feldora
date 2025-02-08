import React from 'react'
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import PostCard from '@components/Post/PostCard/PostCard'
import { useGetPosts } from '@lib/react-query/queries';
import { Helmet } from 'react-helmet-async';

export default function Home() {

  const { data: posts, isPending: loading } = useGetPosts();

  if (loading) return (
    <Container maxWidth='xl' sx={{ marginTop: '7rem' }}>
      <Helmet>
        <title>
          Feldora | Home
        </title>
      </Helmet>
      Loading ....
    </Container>
  )

  return (
    <Box>
      <Helmet>
        <title>
          Feldora | Home
        </title>
      </Helmet>

      <Container maxWidth='xl' sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '1.5rem', marginTop: '7rem' }}>
        {posts?.map((item, index) => (
          <PostCard key={index} post={item.node} />
        ))}
      </Container>
    </Box>
  )
}