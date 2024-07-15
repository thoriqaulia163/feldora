import React from 'react'
import { Typography, Box } from '@mui/material'

export default function PostCard({ post }) {
  return (
    <Box
      sx={{
        backdropFilter: 'blur(30px) saturate(200%)',
        borderRadius: '12px',
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
          cursor: 'pointer',
          '::before': {
            filter: 'brightness(.5)',
            top: '-100%',
            left: '200%',
          }
        }
      }}
    >
      <img
        srcSet={`${post.img}?w=162&auto=format&dpr=2 2x`}
        src={`${post.img}?w=162&auto=format`}
        alt={post.title}
        loading="lazy"
        style={{
          display: 'block',
          width: '100%',
          borderRadius: '12px',
        }}
      />
      <Box sx={{ marginTop: '1rem' }}>
        <Typography variant='h4' sx={{ color: 'var(--title-color)' }}>{post.title}</Typography>
        <Typography variant='body1' sx={{ color: 'var(--text-color)' }}>{post.content?post.content:'-'}</Typography>
      </Box>
    </Box>
  )
}