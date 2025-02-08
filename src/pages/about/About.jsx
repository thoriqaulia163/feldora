import React from 'react'
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { Helmet } from 'react-helmet-async';

const About = () => {
  return (
    <Box>
      <Helmet>
        <title>
          Feldora | About
        </title>
      </Helmet>
      <Container maxWidth='xl' sx={{ marginTop: '7rem' }}>
        This is About Page, Available Soon
      </Container>
    </Box>

  )
}

export default About