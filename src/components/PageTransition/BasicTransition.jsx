import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function BasicTransition({ children }) {

    // Scroll To Top
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0);}, [pathname]);
  
    // PAGE TRANSITION ANIMATION
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    )
  }
  