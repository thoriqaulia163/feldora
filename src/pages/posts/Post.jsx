import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Typography,Box } from '@mui/material';
import PostContent from '../../components/PostContent/PostContent';
import { useGetPostDetail } from '../../lib/react-query/queries';
import moment from 'moment'

export default function Post (){
  const suggestBoxWidth = 225;
  const { slug } = useParams();
  const { data:post, isPending:loading } = useGetPostDetail({slug});

  if(loading) return <Box className={'container page-top-padding'}>Loading ....</Box>
  return (
    <Box className='container page-top-padding' sx={{display:'flex', gap:'1.5rem', flexDirection:{xs:'column',md:'row'}}}>
      <Box sx={{width:{xs:'100%',md:`calc(100% - ${suggestBoxWidth}px)`}}}>
        <Typography variant='h1' sx={{fontSize:'3rem', fontWeight:'600', marginBottom:'1rem'}}>{post.title}</Typography> 
        <img 
          src={post.featuredImage.url} 
          style={{width:'100%'}}
        />
        <Typography variant='body1'>{post?.author.name}</Typography> 
        {post?.category?.map((item,index)=> (
          <Typography key={index} variant='body2' color={'green'}>{item.name}</Typography> 
        ))}
        {moment(post?.createdAt).format('MMM DD, YYYY')}
        <PostContent content={post.content}/>
      </Box>
      <Box sx={{width:{xs:'100%',md:suggestBoxWidth},  position:'sticky', background:'red', paddingTop:'0.5rem'}}>
        this is featured post
      </Box>
    </Box>
  )
}
