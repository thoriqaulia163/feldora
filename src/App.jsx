import './global.css'
import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from '@components/navbar/Navbar'
import Footer from '@components/footer/Footer'
import Home from '@pages/home/Home'
import About from '@pages/about/About'
import Post from '@pages/posts/Post'
import Log from '@pages/log/Log'

export default function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode='wait'>
      <Navbar />
      <main className='main'>
        <Routes location={location} key={location.pathname}>
          <Route path='/' element={<AnimationWrapper><Home /></AnimationWrapper>} />
          <Route path='/log' element={<AnimationWrapper><Log /></AnimationWrapper>} />
          <Route path='/about' element={<AnimationWrapper><About /></AnimationWrapper>} />
          <Route path='/post/:slug' element={<AnimationWrapper><Post /></AnimationWrapper>} />
        </Routes>
      </main>
      <Footer />
    </AnimatePresence>
  )
}

function AnimationWrapper({ children }) {

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
