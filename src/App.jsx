import './global.css'
import { Routes, Route } from 'react-router-dom'
import Navbar from '@components/navbar/Navbar'
import Footer from '@components/footer/Footer'
import Home from '@pages/home/Home'
import About from '@pages/about/About'
import Post from '@pages/posts/Post'
import Log from '@pages/log/Log'

function App() {
  return (
    <>
      <Navbar />
      <main className='main'>
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/log' element={<Log/>} />
            <Route path='/about' element={<About />} />
            <Route path='/post/:slug' element={<Post />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
