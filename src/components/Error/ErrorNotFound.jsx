import React from "react";

export default function ErrorNotFound() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="">
        <h1
          style={{ textShadow: "4px 4px #CCFF00" }}
          className="font-zentry text-[16rem] text-center special-font-full text-customPurple-900 text-shadow-lg text-shadow-customYellow-200 "
        >
          404
        </h1>
        <p className="font-mono text-center mt-[-4rem] bg-customYellow-200 text-purple-800">
          <span className="font-bold">Error not Found!</span>
          <br></br>
          <span>What Exactly are you looking for?</span>
        </p>
      </div>
    </div>
  );
}
