import React from "react";
import { Link } from "react-router-dom";
import { NAVIGATION_LINK, SOSMED_LINK } from "../../constants/navigationLink";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Footer() {
  return (
    <div className="w-full min-h-96 bg-gradient-to-b from-indigo-500 to-purple-300 flex flex-col justify-between">
      <div className="px-4 py-8 gap-8 flex flex-col md:flex-row">
        <Link to={"/"} className="special-font-full navbar-heading text-black">
          FELDORA
        </Link>
        <div className=" flex w-full gap-4 md:gap-8 text-xl justify-center flex-col md:flex-row">
          {NAVIGATION_LINK.map((nav, idx) => {
            return (
              <Link key={idx} to={nav.link} className="font-mono">
                {nav.title}
              </Link>
            );
          })}
        </div>

        <div className="flex gap-6">
          {SOSMED_LINK.map((nav, idx) => {
            return (
              <Link to={nav.link} key={idx}>
                <FontAwesomeIcon icon={nav.icon} size="xl" />
              </Link>
            );
          })}
        </div>
      </div>

      <span className="mx-auto mb-4 font-mono text-sm ">
        ©Feldora 2026. All rights reserved.
      </span>
    </div>
  );
}
