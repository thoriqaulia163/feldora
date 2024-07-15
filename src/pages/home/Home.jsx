import React from 'react'
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import Masonry from '@mui/lab/Masonry';
import PostCard from '@components/PostCard/PostCard'
import { getPosts } from '@services/graphql'

// const posts = [
//   {title:'First Post', excerpt:'learning by doin yada yada lol'},
//   {title:'Second Post', excerpt:'Qapla hey you hahahaha, no return from now on!'}
// ]

export default function Home(){
  const [posts,setPosts] = React.useState([])

  // Responsive column count for masonry list
  // isMedium >= 350 or 430, isBig .= 768 or 968 
  const isBig = useMediaQuery('(min-width:768px)');
  const isMedium = useMediaQuery('(min-width:430px)');

  React.useEffect(()=>{
    getPosts().then((res)=>{
      // console.log(res)
      setPosts(res)
    })
  },[])

  return (
    <Box className={'container'} sx={{paddingTop:'6rem'}}>
      {/* <h1>Home Page </h1>
      <Box sx={{paddingTop:'6rem'}}>
        {posts.map((post)=> <PostCard key={post.node.title} post={post.node}/> )}
      </Box> */}
      <Masonry columns={isBig?3 : isMedium?2 : 1} spacing={2}>
        {itemData.map((item, index) => (
          <Box key={index} sx={{
            borderRadius:4, 
            overflow:'hidden', 
            border:'2px solid var(--text-color)',
            transition:'ease-in-out 0.2s',
            '&:hover':{
              border:'2px solid var(--first-color)',
              cursor:'pointer'
            }
          }}>
            <img
              srcSet={`${item.img}?w=162&auto=format&dpr=2 2x`}
              src={`${item.img}?w=162&auto=format`}
              alt={item.title}
              loading="lazy"
              style={{
                display: 'block',
                width: '100%',
              }}
            />
            <Box>
              <Typography variant='h3' sx={{color:'var(--first-color)'}}>{item.title}</Typography>
            </Box>
          </Box>
        ))}
      </Masonry>
    </Box>
  )
}

const itemData = [
  {
    img: 'https://images.unsplash.com/photo-1518756131217-31eb79b20e8f',
    title: 'Fern',
  },
  {
    img: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f',
    title: 'Snacks',
  },
  {
    img: 'https://images.unsplash.com/photo-1597645587822-e99fa5d45d25',
    title: 'Mushrooms',
  },
  {
    img: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383',
    title: 'Tower',
  },
  {
    img: 'https://images.unsplash.com/photo-1471357674240-e1a485acb3e1',
    title: 'Sea star',
  },
  {
    img: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62',
    title: 'Honey',
  },
  {
    img: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6',
    title: 'Basketball',
  },
  {
    img: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
    title: 'Breakfast',
  },
  {
    img: 'https://images.unsplash.com/photo-1627328715728-7bcc1b5db87d',
    title: 'Tree',
  },
  {
    img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d',
    title: 'Burger',
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
  },
  {
    img: 'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c',
    title: 'Coffee',
  },
  {
    img: 'https://images.unsplash.com/photo-1627000086207-76eabf23aa2e',
    title: 'Camping Car',
  },
  {
    img: 'https://images.unsplash.com/photo-1533827432537-70133748f5c8',
    title: 'Hats',
  },
  {
    img: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af',
    title: 'Tomato basil',
  },
  {
    img: 'https://images.unsplash.com/photo-1627328561499-a3584d4ee4f7',
    title: 'Mountain',
  },
  {
    img: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6',
    title: 'Bike',
  },
];
