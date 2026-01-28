import React from 'react'
import './postBodyContent.css'

export default function PostBodyContent({ content }) {
  return (
    <div marginTop={'1rem'} dangerouslySetInnerHTML={{ __html: content.html }} className='postContentFormat' />
  )
}