import React from 'react'
import { useParams } from 'react-router-dom'
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { useGetPostDetail } from '../../lib/react-query/queries';
import moment from 'moment'
import { Helmet } from 'react-helmet-async';

export default function Post() {
  const { slug } = useParams();
  const { data: post, isPending: loading } = useGetPostDetail({ slug });

  if (loading) return (
    <Box className={'container page-top-padding'}>
      <Helmet>
        <title>
          Feldora | Post
        </title>
      </Helmet>
      Loading ....
    </Box>
  )
  return (
    <>
      <Helmet>
        <title>
          Feldora | {slug}
        </title>
      </Helmet>

      <Container maxWidth='lg' sx={{ marginTop: '7rem', }}>
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

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', marginTop: '1rem' }}>
          <Box sx={{ width: { xs: '100%', md: `62%` } }}>
            <img src={post.featuredImage.url} style={{ width: '100%', height: 'auto' }} />
            <Box className='post-content' marginTop={'1rem'} dangerouslySetInnerHTML={{ __html: (post.content).html }}
              sx={{
                '& img': {
                  width: '100% '
                },
                '& ol':{
                  padding:'1rem 0 1rem 1rem'
                },
                '& ul':{
                  listStyle:'square',
                  padding:'1rem 0 1rem 1rem',
                },
                '& code':{
                  borderRadius:'4px',
                  background:'rgb(240, 249, 249)',
                  border:'1px solid rgb(229, 229, 229)',
                  padding:'4px',
                },
                '& pre':{
                  borderRadius:'4px',
                  background:'rgb(249, 249, 249)',
                  border:'1px solid rgb(229, 229, 229)',
                  padding:'1.5rem',
                },
                '& pre code':{
                  border:'0',
                  padding:'0'
                },
                '& blockquote':{
                  paddingLeft:'1rem',
                  borderLeft:'4px solid rgb(196, 196, 196)',
                },
              }}
            />
          </Box>
          <Box sx={{ width: { xs: '100%', md: '34%' }, position: 'sticky', border: '1px solid', borderColor: 'divider', borderRadius: '12px', padding: '1rem',}}>
            this is featured Section Will available soon
          </Box>
        </Box>
      </Container>
    </>
  )
}
