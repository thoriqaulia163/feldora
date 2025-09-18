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
    <div>
      <Helmet>
        <title>
          Feldora | Home
        </title>
      </Helmet>
      <Hero />
      <div className=' bg-gradient-to-r from-[#0474A8] to-[#0459A850] h-[13.25rem] text-[#6F00FF] font-bold m-2 p-2 flex flex-col items-end justify-between md:flex-row md:items-start'>
        <div className='bg-yellow-400'>ini 13.25rem</div>
        <div className='bg-blue-400'>kocak</div>
      </div>
      <div className='bg-red-400 h-[13.25rem] text-[#6F00FF] font-bold m-2 p-2 grid grid-cols-10 md:grid-rows-5'>
        <div className='bg-yellow-400 row-span-2'>ini 13.25rem</div>
        <div className='bg-blue-400 row-span-1'>kocak</div>
      </div>
      <div>
        <p className='text-4xl'>ini P</p>
        <h1 className='text-4xl'>ini H1</h1>
        <h2 className='text-4xl'>ini H2</h2>
      </div>
      {/* <Container maxWidth='xl' sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '1.5rem', marginTop: '7rem' }}>
        {posts?.map((item, index) => (
          <PostCard key={index} post={item.node} />
        ))}
      </Container> */}
    </div>
  )
}