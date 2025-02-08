import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Box from '@mui/material/Box';

export default function StairTransition({ children }) {

  // Scroll To Top
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  // PAGE TRANSITION ANIMATION
  const numberOfColumns = 5

  const anim = (variants, custom) => {
    return {
      initial: 'initial',
      animate: 'enter',
      exit: 'exit',
      transition: 'transition',
      variants,
      custom,
    }
  }

  const expand = {
    initial: {
      top: 0
    },
    enter: (i) => ({
      top: "100vh",
      transition: {
        duration: 0.4,
        delay: 0.05 * i,
        ease: [0.215, 0.61, 0.355, 1],
      },
      transitionEnd: { height: "0", top: "0" }
    }),
    exit: (i) => ({
      height: "100vh",
      transition: {
        duration: 0.4,
        delay: 0.05 * i,
        ease: [0.215, 0.61, 0.355, 1]
      }
    })
  }


  return (
    <Box>
      {children}
      <Box sx={{
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: '0',
        left: '0',
        pointerEvents: 'none',
        display: "flex",
        zIndex: '5'
      }}>
        {
          [...Array(numberOfColumns)].map((_, i) => {
            return <motion.div key={i}
              {...anim(expand, numberOfColumns - i)}
              style={{ position: 'relative', height: '100%', width: '100%', backgroundColor: 'black' }}
              // initial={{ top: 0 }}
              // animate={{ top:'100vh', transition:{duration:0.4, delay:0.05 * i,} }}
              // exit={{ height:'100vh', transition:{duration:0.4, delay:0.05 * i,} }}
            />
          })
        }
      </Box>
    </Box>
  )
}
