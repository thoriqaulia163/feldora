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
import { NAVIGATION_LINK } from "../../constants/navigationLink";

// import ToggleColorMode from './ToggleColorMode';
// import webLogo from '@assets/feldora-logo-2.webp'

const navLinkStyle =
  "flex items-center gap-4 text-purple-300 hover:text-gray-200 font-bold font-mono";
const navIconStyle =
  "bg-customYellow-200 text-black rounded-full h-10 w-10 flex justify-center items-center";

export default function Navbar({}) {
  const [openMenu, setOpenMenu] = React.useState(false);

  return (
    <>
      <div className="fixed bg-black w-full z-20 h-14 px-4 py-2 box-border flex justify-between items-center">
        <Link
          to={"/"}
          className="special-font navbar-heading text-transparent bg-clip-text bg-gradient-to-br to-customYellow-300 from-customWhite-100"
        >
          F<b>E</b>LDOR<b>A</b>
        </Link>
        <button
          onClick={() => setOpenMenu(!openMenu)}
          className="bg-customYellow-200 rounded-xl h-10 w-10"
        >
          <FontAwesomeIcon
            icon={faCompass}
            size="lg"
            className={`${openMenu && "-rotate-90"} transition duration-300 ease-in-out  `}
          />
        </button>
      </div>

      <div
        className={`fixed z-10 w-full h-screen ${openMenu ? "bg-black/50 top-14" : "bg-black/0 -top-[100vh]"} box-border overflow-hidden transition-all duration-300 ease-in-out`}
      >
        <div
          className={`flex flex-col w-full h-full gap-4 items-end pt-4 px-4`}
        >
          {NAVIGATION_LINK.map((nav, idx) => {
            return (
              <Link
                key={idx}
                to={nav.link}
                className={navLinkStyle}
                onClick={() => setOpenMenu(!openMenu)}
              >
                <p>{nav.title}</p>
                <div className={navIconStyle}>
                  <FontAwesomeIcon icon={nav.icon} size="lg" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
