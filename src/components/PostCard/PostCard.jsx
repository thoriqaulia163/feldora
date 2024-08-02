import React from 'react'
import { Typography, Box, Link } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function PostCard({ post }) {
  return (
    <Box
      sx={{
        backdropFilter: 'blur(30px) saturate(200%)',
        borderRadius: '8px',
        boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.05), 0 20px 50px 0 rgba(0, 0, 0, 0.1)',
        backgroundColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
        transition: 'ease-in-out 0.2s',
        padding: '1rem',
        '::before': {
          position: 'fixed',
          content: '""',
          boxShadow: '0 0 100px 40px #ffffff28',
          top: '-10%',
          left: '-100%',
          transform: 'rotate(-45deg)',
          height: '60rem',
          transition: '.7s all',
        },
        '&:hover': {
          boxShadow: '0 0 0 2px var(--first-color), 0 10px 60px 0 rgba(0, 0, 0, 0.1)',
          transform: 'scale(1.015)',
          '::before': {
            filter: 'brightness(.5)',
            top: '-100%',
            left: '200%',
          }
        }
      }}
    >
      <img
        srcSet={`${post.featuredImage.url}?w=162&auto=format&dpr=2 2x`}
        src={`${post.featuredImage.url}?w=162&auto=format`}
        alt={post.title}
        style={{
          display: 'block',
          width: '100%',
          borderRadius: '8px',
        }}
      />
      <Box sx={{ marginTop: '1rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
        <Typography variant='h5' fontWeight={'bold'} color={'var(--title-color)'} >{post.title}</Typography>
        <Typography variant='body2' color={'var(--text-color)'} >{post.excerpt?post.excerpt:'-'}</Typography>
        <Box sx={{display:'flex', justifyContent:'center', alignItems:'center'}}>
          <Link 
            component={RouterLink} 
            to={`/post/${post.slug}`}
            sx={{
              textDecoration:'none', 
              background:'var(--first-color)', 
              padding:'0.75rem 0.75rem', 
              color:'white', 
              borderRadius:'4px',
              '&:hover': {backgroundColor:'var(--first-color-alt)'}
            }}
          >
            Continue Reading
          </Link>
        </Box>
      </Box>
    </Box>
  )
}