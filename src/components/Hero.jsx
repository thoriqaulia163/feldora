import React from 'react'

export default function Hero (){
  return (
    <div className='relative h-96 w-screen overflow-x-hidden'>
       <h1 className='special-font hero-heading absolute top-5 left-5 bg-red-500'>
          F<b>E</b>LD<b>O</b>R<b>A</b>
        </h1>
        <h1 className='special-font hero-heading absolute bottom-5 right-5'>
          PR<b>O</b>J<b>E</b>CT
        </h1>
    </div>
  )
}
