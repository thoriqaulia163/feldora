import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Typography,Box } from '@mui/material';
import PostContent from '../../components/PostContent/PostContent';
import { useGetPostDetail } from '../../lib/react-query/queries';
import moment from 'moment'

export default function Post (){
  const { slug } = useParams();

  const { data:post, isPending:loading } = useGetPostDetail({slug});
  // const [post,setPost] = useState()

  // React.useEffect(() => {
  //   getPostDetail(slug).then((res) => {
  //     console.log('slug', slug)
  //     console.log('post detail',res)
  //     setPost(res)
  //   })
  // }, [])

  if(loading) return <Box className={'container'} sx={{ paddingTop: '6rem' }}>Loading ....</Box>
  return (
    <div className='container' style={{paddingTop:'6rem'}}>
      <Typography variant='h1'>{post.title}</Typography> 
      <img src={post.featuredImage.url} />
      <Typography variant='body1'>{post?.author.name}</Typography> 
      {post?.category?.map((item,index)=> (
        <Typography key={index} variant='body2' color={'green'}>{item.name}</Typography> 
      ))}
      {moment(post?.createdAt).format('MMM DD, YYYY')}
      <PostContent content={post.content}/>
    </div>
  )
}
