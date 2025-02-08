import * as React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
// import ToggleColorMode from './ToggleColorMode';
import webLogo from '@assets/feldora-logo-2.webp'

const desktopMenuItemStyle = { 
  py: '6px', 
  px: '12px', 
  borderRadius: '8px' 
}

export default function Navbar({ }) {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  return (
    <div>
      <AppBar
        position="fixed"
        sx={{
          boxShadow: 0,
          bgcolor: 'transparent',
          backgroundImage: 'none',
          mt: 2,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            variant="regular"
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              borderRadius: '20px',
              bgcolor: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(24px)',
              maxHeight: 40,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: `0 0 1px rgba(85, 166, 246, 0.1), 1px 1.5px 2px -1px rgba(85, 166, 246, 0.15), 4px 4px 12px -2.5px rgba(85, 166, 246, 0.15)`,
            })}
          >
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                px: 0,
              }}
            >
              <Box sx={{ width: '140px', display: 'flex', gap: '4px', alignItems: 'center', marginRight:'2rem' }}>
                <img
                  src={webLogo}
                  alt="logo of sitemark"
                  style={{ width: '40px', height: '40px'}}
                />
                <Typography variant="h3" color="text.primary">Feldora</Typography>
              </Box>
              <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                <Link to='/'>
                  <MenuItem
                    sx={desktopMenuItemStyle}
                  >
                    <Typography variant="body1" color="text.primary">
                      Home
                    </Typography>
                  </MenuItem>
                </Link>
                <Link to='/about'>
                  <MenuItem
                    sx={desktopMenuItemStyle}
                  >
                    <Typography variant="body1" color="text.primary">
                      About
                    </Typography>
                  </MenuItem>
                </Link>
                <Link to='/log'>
                  <MenuItem
                    sx={desktopMenuItemStyle}
                  >
                    <Typography variant="body1" color="text.primary">
                      Log
                    </Typography>
                  </MenuItem>
                </Link>
              </Box>
            </Box>
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                gap: 0.5,
                alignItems: 'center',
              }}
            >
              {/* <ToggleColorMode mode={mode} toggleColorMode={toggleColorMode} /> */}
              <Button
                color="primary"
                variant="text"
                size="small"
                component="a"
                href="/material-ui/getting-started/templates/sign-in/"
                target="_blank"
                disabled
              >
                Sign in
              </Button>
              <Button
                color="primary"
                variant="contained"
                size="small"
                component="a"
                href="/material-ui/getting-started/templates/sign-up/"
                target="_blank"
                disabled
              >
                Sign up
              </Button>
            </Box>
            <Box sx={{ display: { sm: '', md: 'none' } }}>
              <Button
                variant="text"
                color="primary"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{ minWidth: '30px', p: '4px' }}
              >
                <MenuIcon />
              </Button>
              <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
                <Box
                  sx={{
                    minWidth: '60dvw',
                    p: 2,
                    backgroundColor: 'background.paper',
                    flexGrow: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'end',
                      flexGrow: 1,
                    }}
                  >
                    {/* <ToggleColorMode mode={mode} toggleColorMode={toggleColorMode} /> */}
                  </Box>
                  <Link to='/' onClick={()=>setOpen(false)}>
                    <MenuItem>
                      <Typography variant="body1" color="text.primary">
                        Home
                      </Typography>
                    </MenuItem>
                  </Link>
                  <Link to='/about' onClick={()=>setOpen(false)}>
                    <MenuItem>
                      <Typography variant="body1" color="text.primary">
                        About
                      </Typography>
                    </MenuItem>
                  </Link>
                  <Link to='/log' onClick={()=>setOpen(false)}>
                    <MenuItem>
                      <Typography variant="body1" color="text.primary">
                        Log
                      </Typography>
                    </MenuItem>
                  </Link>
                  <Divider />
                  <MenuItem>
                    <Button
                      color="primary"
                      variant="contained"
                      component="a"
                      href="/material-ui/getting-started/templates/sign-up/"
                      target="_blank"
                      sx={{ width: '100%' }}
                      disabled
                      onClick={()=>setOpen(false)}
                    >
                      Sign up
                    </Button>
                  </MenuItem>
                  <MenuItem>
                    <Button
                      color="primary"
                      variant="outlined"
                      component="a"
                      href="/material-ui/getting-started/templates/sign-in/"
                      target="_blank"
                      sx={{ width: '100%' }}
                      disabled
                      onClick={()=>setOpen(false)}
                    >
                      Sign in
                    </Button>
                  </MenuItem>
                </Box>
              </Drawer>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </div>
  );
}

//   return (
//     <header className="header" id="header">
//       <nav className="nav container" >
//         <Link to="/" className="nav__logo">Feldora</Link>

//         <Box className="nav__menu" id="nav-menu">
//           <ul className="nav__list grid">
//             <li className="nav__item">
//               <Link to="/" className="nav__link">
//                 <i className="nav__icon"><HomeOutlinedIcon/></i> Home
//               </Link>
//             </li>
//             <li className="nav__item">
//               <Link to="/log" className="nav__link">
//                 <i className="nav__icon"><SearchRoundedIcon/></i> Log
//               </Link>
//             </li>
//             <li className="nav__item">
//               <Link to="/about" className="nav__link">
//                 <i className="nav__icon"><HelpCenterOutlinedIcon/></i> About
//               </Link>
//             </li>
//           </ul>
//           <i className="nav__close" id="nav-close" onClick={() => handleMobileCloseMenu()}>
//             <CloseRoundedIcon />
//           </i>
//         </Box>

//         <div className="nav__btns">
//           <i className="change-theme" id="theme-button" onClick={()=> themeHandler()}>
//             { selectedTheme === 'dark' ?
//               <DarkModeOutlinedIcon/> :
//               <WbSunnyOutlinedIcon/>
//             }
//           </i>
//           <i className="nav__toggle" id="nav-toggle" onClick={() => handleMobileOpenMenu()}>
//             <WidgetsOutlinedIcon />
//           </i>
//         </div>
//       </nav>
//       navbar
//     </header>
//   )
// }

