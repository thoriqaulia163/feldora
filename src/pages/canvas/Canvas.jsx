import React from 'react'
import { useGetPosts } from '@lib/react-query/queries';
import { Helmet } from 'react-helmet-async';

export default function Canvas() {

  const { data: posts, isPending: loading } = useGetPosts();

  if (loading) return (
    <div >
      <Helmet>
        <title>
          Feldora | Canvas
        </title>
      </Helmet>
      Loading ....
    </div>
  )

  return (
    <div className='min-h-screen'>
      <Helmet>
        <title>
          Feldora | Canvas
        </title>
      </Helmet>
      <div className='mt-24 bg-gradient-to-r from-[#0474A8] to-[#0459A850] h-[13.25rem] text-[#6F00FF] font-bold m-2 p-2 flex flex-col items-end justify-between md:flex-row md:items-start'>
        <div className='bg-yellow-400'>ini 13.25rem</div>
        <button onClick={()=>alert('clicked')} className='bg-purple-600'>click me !</button>
        <div className='bg-blue-400'>kocak</div>
      </div>
      <div className='bg-red-400 h-[13.25rem] text-[#6F00FF] font-bold m-2 p-2 grid grid-cols-10 md:grid-rows-5'>
        <div className='bg-yellow-400 row-span-2'>ini 13.25rem</div>
        <div className='bg-blue-400 row-span-1'>kocak</div>
      </div>
      <div>
        <p >ini P</p>
        <h1 >ini H1</h1>
        <h2 >ini H2</h2>
      </div>
      <div className='flex'>
        <div className='w-4 h-4 m-1 bg-yellow-50'></div>
        <div className='w-4 h-4 m-1 bg-yellow-100'></div>
        <div className='w-4 h-4 m-1 bg-yellow-200'></div>
        <div className='w-4 h-4 m-1 bg-yellow-300'></div>
        <div className='w-4 h-4 m-1 bg-yellow-400'></div>
        <div className='w-4 h-4 m-1 bg-yellow-500'></div>
        <div className='w-4 h-4 m-1 bg-yellow-600'></div>
        <div className='w-4 h-4 m-1 bg-yellow-700'></div>
        <div className='w-4 h-4 m-1 bg-yellow-800'></div>
        <div className='w-4 h-4 m-1 bg-yellow-900'></div>
        <div className='w-4 h-4 m-1 bg-yellow-950'></div>
      </div>
      <div className='flex'>
        <div className='w-4 h-4 m-1 bg-blue-50'></div>
        <div className='w-4 h-4 m-1 bg-blue-100'></div>
        <div className='w-4 h-4 m-1 bg-blue-200'></div>
        <div className='w-4 h-4 m-1 bg-blue-300'></div>
        <div className='w-4 h-4 m-1 bg-blue-400'></div>
        <div className='w-4 h-4 m-1 bg-blue-500'></div>
        <div className='w-4 h-4 m-1 bg-blue-600'></div>
        <div className='w-4 h-4 m-1 bg-blue-700'></div>
        <div className='w-4 h-4 m-1 bg-blue-800'></div>
        <div className='w-4 h-4 m-1 bg-blue-900'></div>
        <div className='w-4 h-4 m-1 bg-blue-950'></div>
      </div>
      <div className='flex'>
        <div className='w-4 h-4 m-1 bg-violet-50'></div>
        <div className='w-4 h-4 m-1 bg-violet-100'></div>
        <div className='w-4 h-4 m-1 bg-violet-200'></div>
        <div className='w-4 h-4 m-1 bg-violet-300'></div>
        <div className='w-4 h-4 m-1 bg-violet-400'></div>
        <div className='w-4 h-4 m-1 bg-violet-500'></div>
        <div className='w-4 h-4 m-1 bg-violet-600'></div>
        <div className='w-4 h-4 m-1 bg-violet-700'></div>
        <div className='w-4 h-4 m-1 bg-violet-800'></div>
        <div className='w-4 h-4 m-1 bg-violet-900'></div>
        <div className='w-4 h-4 m-1 bg-violet-950'></div>
      </div>
      <h2>Custom Color</h2>
      <div className='flex'>
        <div className='w-4 h-4 m-1 bg-customYellow-100'></div>
        <div className='w-4 h-4 m-1 bg-customYellow-200'></div>
        <div className='w-4 h-4 m-1 bg-customYellow-300'></div>
      </div>
      <div className='flex'>
        <div className='w-4 h-4 m-1 bg-customBlue-50'></div>
        <div className='w-4 h-4 m-1 bg-customBlue-75'></div>
        <div className='w-4 h-4 m-1 bg-customBlue-100'></div>
        <div className='w-4 h-4 m-1 bg-customBlue-200'></div>
        <div className='w-4 h-4 m-1 bg-customBlue-300'></div>
      </div>
      <div className='flex'>
        <div className='w-4 h-4 m-1 bg-customViolet-300'></div>      
      </div>
      <div className='flex'>
        <div className='w-4 h-4 m-1 bg-customPurple-100'></div>
        <div className='w-4 h-4 m-1 bg-customPurple-300'></div>
        <div className='w-4 h-4 m-1 bg-customPurple-400'></div>
        <div className='w-4 h-4 m-1 bg-customPurple-500'></div>
        <div className='w-4 h-4 m-1 bg-customPurple-900'></div>
      </div>
      {/* <Container maxWidth='xl' sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '1.5rem', marginTop: '7rem' }}>
        {posts?.map((item, index) => (
          <PostCard key={index} post={item.node} />
        ))}
      </Container> */}
    </div>
  )
}