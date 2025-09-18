import * as React from 'react';
import { Link } from 'react-router-dom';

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
    <div 
    className='fixed bg-amber-400 opacity-50 w-full z-10'>
      Navbar
    </div>
  );
}

