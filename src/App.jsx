import './global.css'
import { Routes, Route, useLocation } from 'react-router-dom'
// import { AnimatePresence } from 'framer-motion'
// import BasicTransition from '@components/PageTransition/BasicTransition'
import Navbar from '@components/navbar/Navbar'
import Footer from '@components/footer/Footer'
import Home from '@pages/home/Home'
import About from '@pages/about/About'
import Post from '@pages/posts/Post'
import Log from '@pages/log/Log'
import Canvas from '@pages/canvas/Canvas'

export default function App() {
  const location = useLocation()

  return (
    <div>
      <Navbar />
      <main className='relative min-h-screen w-screen overflow-x-hidden'>
        <Routes location={location} key={location.pathname}>
          <Route path='/' element={<Home />} />
          <Route path='/log' element={<Log />} />
          <Route path='/canvas' element={<Canvas />} />
          <Route path='/about' element={<About />} />
          <Route path='/post/:slug' element={<Post />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
