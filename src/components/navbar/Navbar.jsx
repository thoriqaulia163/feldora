import React, { useState, useLayoutEffect, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Box } from '@mui/material'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HelpCenterOutlinedIcon from '@mui/icons-material/HelpCenterOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import './navbar.css';

export default function Navbar() {

  // Set Default Theme
  const localTheme = localStorage.getItem('local-theme') ? localStorage.getItem('local-theme') : 'light'
  const [selectedTheme,setSelectedTheme] = useState(localTheme)
  useLayoutEffect(()=>{
    document.body.classList[localTheme === 'light' ? 'remove' : 'add']('dark-theme')
  },[])

  // Add Traditional EventListener
  useEffect(() => {
    function handleScroll (){
      const nav = document.getElementById('header')
      if(this.scrollY >= 80) nav.classList.add('scroll-header'); else nav.classList.remove('scroll-header')
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Theme Changer Function
  function themeHandler() {
    if(selectedTheme === 'dark'){
      setSelectedTheme('light')
      localStorage.setItem('local-theme','light')
      document.body.classList['remove']('dark-theme')
    }else{
      setSelectedTheme('dark')
      localStorage.setItem('local-theme','dark')
      document.body.classList['add']('dark-theme')
    }
  }

  function handleMobileCloseMenu(){
    document.getElementById('nav-menu').classList.remove('show-menu')
  }
  function handleMobileOpenMenu(){
    document.getElementById('nav-menu').classList.add('show-menu')
  }

  return (
    <header className="header" id="header">
      <nav className="nav container" >
        <Link to="/" className="nav__logo">Feldora</Link>

        <Box className="nav__menu" id="nav-menu">
          <ul className="nav__list grid">
            <li className="nav__item">
              <Link to="/" className="nav__link">
                <i className="nav__icon"><HomeOutlinedIcon/></i> Home
              </Link>
            </li>
            <li className="nav__item">
              <Link to="/search" className="nav__link">
                <i className="nav__icon"><SearchRoundedIcon/></i> Search
              </Link>
            </li>
            <li className="nav__item">
              <Link to="/about" className="nav__link">
                <i className="nav__icon"><HelpCenterOutlinedIcon/></i> About
              </Link>
            </li>
            {/* <li className="nav__item">
              <Link to="/portfolio" className="nav__link">
                <i className="uil uil-scenery nav__icon"></i> Portfolio
              </Link>
            </li>
            <li className="nav__item">
              <Link to="/contact" className="nav__link">
                <i className="uil uil-message nav__icon"></i> Contact
              </Link>
            </li> */}
          </ul>
          <i className="nav__close" id="nav-close" onClick={() => handleMobileCloseMenu()}>
            <CloseRoundedIcon />
          </i>
        </Box>

        <div className="nav__btns">
          <i className="change-theme" id="theme-button" onClick={()=> themeHandler()}>
            { selectedTheme === 'dark' ?
              <DarkModeOutlinedIcon/> :
              <WbSunnyOutlinedIcon/>
            }
          </i>
          <i className="nav__toggle" id="nav-toggle" onClick={() => handleMobileOpenMenu()}>
            <WidgetsOutlinedIcon />
          </i>
        </div>
      </nav>
    </header>
  )
}

