import React from 'react'
import { Link } from 'react-router-dom'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import webLogo from '@assets/feldora-logo-2.webp'
import InstagramIcon from '@mui/icons-material/Instagram';
import GitHubIcon from '@mui/icons-material/GitHub';
import XIcon from '@mui/icons-material/X';

export default function Footer() {
  return (
    <Box sx={{ background: 'rgb(244,245,247)' }}>
      <Container maxWidth='xl' sx={{ marginTop: '3rem', py: '2rem', }}>
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: "flex-start", md: 'center' },
            flexDirection: { xs: 'column', md: 'row' },
            gap: '1rem',
            px: 0,
          }}
        >
          <Box sx={{ width: '140px', display: 'flex', gap: '4px', alignItems: 'center', marginRight: '2rem' }}>
            <img
              src={webLogo}
              alt="logo of sitemark"
              style={{ width: '40px', height: '40px' }}
            />
            <Typography variant="h3" color="text.primary">Feldora</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: { xs: '0.5rem', md: '1.5rem' }, flexDirection: { xs: 'column', md: 'row' }, }}>
            <Link to='/'>
              <Typography variant="body1" color="text.primary">
                Home
              </Typography>
            </Link>
            <Link to='/about'>

              <Typography variant="body1" color="text.primary">
                About
              </Typography>
            </Link>
            <Link to='/log'>
              <Typography variant="body1" color="text.primary">
                Log
              </Typography>
            </Link>
          </Box>
        </Box>

        <Divider sx={{my:'1.5rem'}}/>

        <Box sx={{
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: "flex-start", md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: '1rem',
          px: 0,
        }}>
          <Box sx={{ display: 'flex', gap: '1.5rem' }}>
            <Link to={'https://instagram.com'} target='blank'>
              <InstagramIcon />
            </Link>
            <Link to={'https://github.com'} target='blank'>
              <GitHubIcon />
            </Link>
            <Link to={'https://x.com'} target='blank'>
              <XIcon />
            </Link>
          </Box>
          <Box>
            <Typography
              variant="body2"
              align="center"
            >
              {" © "}
              2025 Feldora Website. All rights reserved.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}