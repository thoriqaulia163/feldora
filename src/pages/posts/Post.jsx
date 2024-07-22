import { Height } from '@mui/icons-material';
import React from 'react'
import { useParams } from 'react-router-dom'

export default function Post (){
  const { postId } = useParams();

  return (
    <div style={{paddingTop:'6rem'}}>Post {postId}</div>
  )
}
