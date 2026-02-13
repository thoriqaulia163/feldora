import * as React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCompass,
  faHouse,
  faPaintBrush,
  faBook,
  faCircleInfo,
  faNewspaper,
} from "@fortawesome/free-solid-svg-icons";

// import ToggleColorMode from './ToggleColorMode';
// import webLogo from '@assets/feldora-logo-2.webp'

const navLinkStyle =
  "flex items-center gap-4 text-white hover:text-gray-200 font-bold";

export default function Navbar({}) {
  const [openMenu, setOpenMenu] = React.useState(false);

  return (
    <>
      <div className="fixed bg-customYellow-200 w-full z-20 h-14 px-4 py-2 box-border flex justify-between items-center">
        <Link to={"/"} className="special-font navbar-heading">
          F<b>E</b>LDOR<b>A</b>
        </Link>
        <button
          onClick={() => setOpenMenu(!openMenu)}
          className="bg-purple-500 rounded-xl h-10 w-10"
        >
          <FontAwesomeIcon
            icon={faCompass}
            size="lg"
            className={`${openMenu && "-rotate-90"} transition duration-300 ease-in-out text-purple-200 `}
          />
        </button>
      </div>

      <div
        className={`fixed z-10 w-full h-screen ${openMenu ? "bg-black/50 top-14" : "bg-black/0 -top-[100vh]"} box-border overflow-hidden transition-all duration-300 ease-in-out`}
      >
        <div
          className={`flex flex-col w-full h-full gap-4 items-end pt-4 px-4`}
        >
          <Link to={"/"} className={navLinkStyle}>
            <p>Home</p>
            <div className="bg-customPurple-300 rounded-full h-10 w-10 flex justify-center items-center">
              <FontAwesomeIcon icon={faHouse} size="lg" />
            </div>
          </Link>
          <Link to={"/canvas"} className={navLinkStyle}>
            <p>Canvas</p>
            <div className="bg-customPurple-300 rounded-full h-10 w-10 flex justify-center items-center">
              <FontAwesomeIcon icon={faPaintBrush} size="lg" />
            </div>
          </Link>
          <Link to={"/log"} className={navLinkStyle}>
            <p>Log</p>
            <div className="bg-customPurple-300 rounded-full h-10 w-10 flex justify-center items-center">
              <FontAwesomeIcon icon={faBook} size="lg" />
            </div>
          </Link>
          <Link to={"/about"} className={navLinkStyle}>
            <p>About</p>
            <div className="bg-customPurple-300 rounded-full h-10 w-10 flex justify-center items-center">
              <FontAwesomeIcon icon={faCircleInfo} size="lg" />
            </div>
          </Link>
          <Link to={"/blog"} className={navLinkStyle}>
            <p>Blog</p>
            <div className="bg-customPurple-300 rounded-full h-10 w-10 flex justify-center items-center">
              <FontAwesomeIcon icon={faNewspaper} size="lg" />
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
