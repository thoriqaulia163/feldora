import React from 'react'
import { Box } from '@mui/material'

export default function PostContent ({content}){
  return (
    <Box className='post-content' marginTop={'1rem'} dangerouslySetInnerHTML={{ __html: content.html}}></Box>
  )
}
