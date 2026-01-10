import * as React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCompass } from '@fortawesome/free-solid-svg-icons';

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
    <div className='fixed bg-yellowCustom-300 w-full z-10 h-16 px-4 py-2 box-border flex justify-between items-center'>
      <Link to={'/'} className='special-font navbar-heading'>
        F<b>E</b>LD<b>O</b>R<b>A</b>
      </Link>
      <button className='bg-blue-400 rounded-xl h-12 w-12 '>
        <FontAwesomeIcon icon={faCompass} size='xl'/>
      </button>
    </div>
  );
}

