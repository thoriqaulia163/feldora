import React from 'react'
import Box from '@mui/material/Box';

export default function PostBodyContent({ content }) {
  return (
    <Box marginTop={'1rem'} dangerouslySetInnerHTML={{ __html: content.html }}
      sx={{
        marginBottom: '3rem',
        '& img': {
          display:'block',
          maxWidth:'100%',
          width: 'auto',
          height: 'auto',
          margin:'1.5rem auto',
        },
        '& ol': {
          padding: '1rem 0 1rem 1rem'
        },
        '& ul': {
          listStyle: 'square',
          padding: '1rem 0 1rem 1rem',
        },
        '& code': {
          borderRadius: '4px',
          background: 'rgb(240, 249, 249)',
          border: '1px solid rgb(229, 229, 229)',
          padding: '4px',
        },
        '& pre': {
          borderRadius: '4px',
          background: 'rgb(249, 249, 249)',
          border: '1px solid rgb(229, 229, 229)',
          padding: '1.5rem',
        },
        '& pre code': {
          border: '0',
          padding: '0'
        },
        '& blockquote': {
          paddingLeft: '1rem',
          borderLeft: '4px solid rgb(196, 196, 196)',
        },
      }}
    />
  )
}