import './global.css'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/navbar/Navbar'
import Home from '@pages/home/Home'
import Search from '@pages/search/Search'
import About from '@pages/about/About'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/about' element={<About />} />
            <Route path='/search' element={<Search />} />
        </Routes>
      </main>
    </>
  )
}

export default App
