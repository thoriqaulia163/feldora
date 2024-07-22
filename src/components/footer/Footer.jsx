import React from 'react'
import './footer.css'
import { Box } from '@mui/material'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <Box className="footer__bg">
        <Box className="footer__container container grid">
          <Box>
            <h1 className="footer__title">Feldora</h1>
            {/* <span className="footer__subtitle">CS Student</span> */}
            <Box className="footer__socials">
              <Link to="https://www.facebook.com" target="blank" className="footer__social">
                <i className="uil uil-facebook-f">x</i>
              </Link>
              <Link to="https://www.instagram.com" target="blank" className="footer__social">
                <i className="uil uil-instagram">y</i>
              </Link>
              <Link to="https://twitter.com" target="blank" className="footer__social">
                <i className="uil uil-twitter-alt">z</i>
              </Link>
            </Box>
          </Box>

          <ul className="footer__links">
            <li>
              <Link to="#portfolio" className="footer__link">Portfolio</Link>
            </li>
            <li>
              <Link to="#about" className="footer__link">About</Link>
            </li>
            <li>
              <Link to="#contact" className="footer__link">Contact</Link>
            </li>
            <li>
              <Link to="#contact" className="footer__link">Contact</Link>
            </li>
          </ul>

         
         
    
        </Box>

        <p className="footer__copy">&#169; Thoriq Aulia. All right reserved</p>

      </Box>
    </footer>
  )
}