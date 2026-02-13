import "./global.css";
import { Routes, Route, useLocation } from "react-router-dom";
// import { AnimatePresence } from 'framer-motion'
// import BasicTransition from '@components/PageTransition/BasicTransition'
import Navbar from "@components/navbar/Navbar";
import Footer from "@components/footer/Footer";
import Home from "@pages/home/Home";
import About from "@pages/about/About";
import Post from "@pages/posts/Post";
import Log from "@pages/log/Log";
import Canvas from "@pages/canvas/Canvas";
import Blog from "./pages/posts/Blog";
import ErrorNotFound from "./components/Error/ErrorNotFound";

export default function App() {
  const location = useLocation();

  return (
    <div>
      <Navbar />
      <main className="relative min-h-screen w-screen overflow-x-hidden box-border">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/log" element={<Log />} />
          <Route path="/canvas" element={<Canvas />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/post/:slug" element={<Post />} />

          <Route path="*" element={<ErrorNotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
