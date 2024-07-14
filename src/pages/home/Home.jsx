import React from 'react'
import { Box } from '@mui/material'
import PostCard from '@components/PostCard/PostCard'
import { getPosts } from '@services/graphql'

// const posts = [
//   {title:'First Post', excerpt:'learning by doin yada yada lol'},
//   {title:'Second Post', excerpt:'Qapla hey you hahahaha, no return from now on!'}
// ]

export default function Home(){
  const [posts,setPosts] = React.useState([])

  React.useEffect(()=>{
    getPosts().then((res)=>{
      // console.log(res)
      setPosts(res)
    })
  },[])

  return (
    <Box sx={{paddingTop:'6rem'}}>
      <h1>Home Page </h1>
      <Box sx={{paddingTop:'6rem'}}>
        {posts.map((post)=> <PostCard key={post.node.title} post={post.node}/> )}
      </Box>
    </Box>
  )
}
