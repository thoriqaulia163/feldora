import React from 'react'
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { Helmet } from 'react-helmet-async';
import Typography from '@mui/material/Typography';
import KeyboardDoubleArrowUpRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowUpRounded';
import { WEB_UPDATE_LOG } from '../../constants/updateLog';

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
        {WEB_UPDATE_LOG.map((value, key) => (
          <Box key={key}>
            <Box sx={logBoxStyle} >
              <Typography variant='body2'>{value.tanggal}</Typography>
              <Typography variant='h6'>{value.update}</Typography>
            </Box>
            <KeyboardDoubleArrowUpRoundedIcon />
          </Box>
        ))}
      </Container>
    </Box>
  )
}
