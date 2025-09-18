import React from 'react'
import { useParams } from 'react-router-dom'
import { useGetPostDetail } from '../../lib/react-query/queries';
// import moment from 'moment'
import { Helmet } from 'react-helmet-async';
// import PostBodyContent from '@components/Post/PostBodyContent/PostBodyContent';

export default function Post() {
  const { slug } = useParams();
  const { data: post, isPending: loading } = useGetPostDetail({ slug });

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

      {/* <Container maxWidth='lg' sx={{ marginTop: '7rem', }}>
        <Typography variant='h1'>{post.title}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem', my: '1rem' }}>
          <Avatar />
          <Box>
            <Typography variant='body2' color={'InfoText'}>{post?.author.name}</Typography>
            <Typography variant='body2' color={'GrayText'}>{moment(post?.createdAt).format('MMM DD, YYYY')}</Typography>
          </Box>
        </Box>
        {post?.category?.map((item, index) => (
          <Typography key={index} variant='body2' sx={{
            background: 'green',
            display: 'inline-flex',
            p: '4px 8px',
            borderRadius: '999px',
          }}>
            {item.name}
          </Typography>
        ))}

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
