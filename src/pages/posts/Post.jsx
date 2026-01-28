import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { useGetPostDetail } from '../../lib/react-query/queries';
import { Helmet } from 'react-helmet-async';
import { postDateTimeFormat } from '../../utils/dateTimeFormater';
import PostBodyContent from '@components/Post/PostBodyContent/PostBodyContent';

export default function Post() {
  const { slug } = useParams();
  const { data: post, isPending: loading } = useGetPostDetail({ slug });
  console.log(post)

  if (loading) return (
    <div >
      <Helmet>
        <title>
          Feldora | Post
        </title>
      </Helmet>
      Loading ....
    </div>
  )
  return (
    <>
      <Helmet>
        <title>
          Feldora | {slug}
        </title>
      </Helmet>

      <div className=' max-w-2xl mt-16 p-4 mx-auto box-border'>
        <h1 className='font-extrabold font-robert-medium text-2xl'>{post.title}</h1>
        <div className='flex items-center gap-2 my-3 font-mono font-medium'>
          <img src={post.author.photo?.url} className='bg-slate-500 w-8 h-8 rounded-full' />
          <h3>{post?.author.name}</h3>
          <h3 className='text-xs text-slate-700 ml-auto'>Updated at {postDateTimeFormat(post.updatedAt)}</h3>
        </div>
        <hr className=' border-t mb-4 border-gray-400' />
        

        <div className='flex flex-wrap gap-2 mb-2 font-mono'>
          <h3>Category:</h3>
          {post?.category?.map((item, index) => {
            return (
              <p key={index} className={'border border-solid border-purple-700 text-purple-500 bg-purple-200 rounded-3xl px-2'}>
                {item.name}
              </p>
            )
          })}
        </div>

        <img src={post.featuredImage.url} className='w-full mb-8' />

        <PostBodyContent content={post.content}/>
      </div>

      {/* <Container maxWidth='lg' sx={{ marginTop: '7rem', }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem', my: '1rem' }}>
          <Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', marginTop: '1rem', }}>
          <Box sx={{ width: { xs: '100%', md: `62%` } }}>
            <img src={post.featuredImage.url} style={{ width: '100%', height: 'auto', marginBottom:"1.5rem" }} />
            <PostBodyContent content={post.content}/>
          </Box>
          <Box sx={{ width: { xs: '100%', md: '34%' }, position: 'sticky', top:'6.5rem', border: '1px solid', borderColor: 'divider', borderRadius: '12px', padding: '1rem', height:'20rem'}}>
            this is featured Section Will available soon
          </Box>
        </Box>
      </Container> */}
    </>
  )
}
