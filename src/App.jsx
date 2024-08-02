import './global.css'
import { Routes, Route } from 'react-router-dom'
import Navbar from '@components/navbar/Navbar'
import Footer from '@components/footer/Footer'
import Home from '@pages/home/Home'
import Search from '@pages/search/Search'
import About from '@pages/about/About'
import Post from '@pages/posts/Post'
import Posts from '@pages/posts/Posts'

function App() {
  return (
    <>
      <Navbar />
      <main className='main'>
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/about' element={<About />} />
            <Route path='/search' element={<Search />} />
            <Route path='/post/' element={<Posts />} />
            <Route path='/post/:slug' element={<Post />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
