import './global.css'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/navbar/Navbar'
import Home from '@pages/Home/Home'
import Search from '@pages/Search/Search'
import About from '@pages/About/About'

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
