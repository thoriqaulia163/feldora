import './global.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import BasicTransition from '@components/PageTransition/BasicTransition'
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
          <Route path='/' element={<BasicTransition><Home /></BasicTransition>} />
          <Route path='/log' element={<BasicTransition><Log /></BasicTransition>} />
          <Route path='/about' element={<BasicTransition><About /></BasicTransition>} />
          <Route path='/post/:slug' element={<BasicTransition><Post /></BasicTransition>} />
        </Routes>
      </main>
      <Footer />
    </AnimatePresence>
  )
}
