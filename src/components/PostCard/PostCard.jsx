import React from 'react'
import { Typography, Box } from '@mui/material'

export default function PostCard({ post }) {
  return (
    <Box>
      <Typography variant='h3' sx={{color:'var(--first-color)'}}>{post.title}</Typography>
      <Typography variant='body1'>{post.excerpt}</Typography>
    </Box>
  )
}