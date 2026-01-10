import React from 'react'
import { useGetPosts } from '@lib/react-query/queries';
import { Helmet } from 'react-helmet-async';
import Hero from '@components/Hero';

export default function Home() {

  const { data: posts, isPending: loading } = useGetPosts();

  if (loading) return (
    <div >
      <Helmet>
        <title>
          Feldora | Home
        </title>
      </Helmet>
      Loading ....
    </div>
  )

  return (
    <div className='min-h-screen'>
      <Helmet>
        <title>
          Feldora | Home
        </title>
      </Helmet>
      <Hero />
      {/* <Container maxWidth='xl' sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '1.5rem', marginTop: '7rem' }}>
        {posts?.map((item, index) => (
          <PostCard key={index} post={item.node} />
        ))}
      </Container> */}
    </div>
  )
}