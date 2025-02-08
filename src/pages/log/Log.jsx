import React from 'react'
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { Helmet } from 'react-helmet-async';
import Typography from '@mui/material/Typography';
import KeyboardDoubleArrowUpRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowUpRounded';

const logBoxStyle = {
  background: 'rgb(212, 212, 212)',
  padding: '1rem',
  borderRadius: '8px'
}

export default function Log() {
  return (
    <Box>
      <Helmet>
        <title>
          Feldora | Log
        </title>
      </Helmet>

      <Container maxWidth='xl' sx={{ marginTop: '7rem' }}>
        <Box sx={logBoxStyle}>
          <Typography variant='body2'>8 Februari 2025</Typography>
          <Typography variant='h6'>Fixing post page layout, body-content-HTML, and post card</Typography>
        </Box>
        <Box sx={logBoxStyle}>
          <Typography variant='body2'>8 Februari 2025</Typography>
          <Typography variant='h6'>Revamp UI, styling, and layout. Add log. add new webLogo. Add page animation. Implement React-helmet</Typography>
        </Box>
        <KeyboardDoubleArrowUpRoundedIcon />
        <Box sx={logBoxStyle}>
          <Typography variant='body2'>2 Agustus 2024</Typography>
          <Typography variant='h6'>Implement Getpost and post page using react-query and graphQL</Typography>
        </Box>
        <KeyboardDoubleArrowUpRoundedIcon />
        <Box sx={logBoxStyle}>
          <Typography variant='body2'>22 Juli 2024</Typography>
          <Typography variant='h6'>Initialize react-query</Typography>
        </Box>
        <KeyboardDoubleArrowUpRoundedIcon />
        <Box sx={logBoxStyle}>
          <Typography variant='body2'>9 Juli 2024</Typography>
          <Typography variant='h6'>Initialize Project</Typography>
        </Box>

      </Container>
    </Box>
  )
}
