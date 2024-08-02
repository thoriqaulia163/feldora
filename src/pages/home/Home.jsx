import React from 'react'
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import Masonry from '@mui/lab/Masonry';
import PostCard from '@components/PostCard/PostCard'
import { useGetPosts } from '@lib/react-query/queries';

// const posts = [
//   {title:'First Post', excerpt:'learning by doin yada yada lol'},
//   {title:'Second Post', excerpt:'Qapla hey you hahahaha, no return from now on!'}
// ]

export default function Home() {
  // const [posts, setPosts] = React.useState([])

  // Responsive column count for masonry list
  // isMedium >= 350 or 430, isBig .= 768 or 968 
  const isBig = useMediaQuery('(min-width:768px)');
  const isMedium = useMediaQuery('(min-width:468px)');

  const { data:posts, isPending:loading } = useGetPosts();

  // React.useEffect(() => {
  //   getPosts().then((res) => {
  //     console.log(res)
  //     setPosts(res)
  //   })
  // }, [])

  if(loading) return <Box className={'container'} sx={{ paddingTop: '6rem' }}>Loading ....</Box>

  return (
    <Box className={'container'} sx={{ paddingTop: '6rem' }}>

      <Masonry columns={isBig ? 3 : isMedium ? 2 : 1} spacing={2}>
        {posts?.map((item, index) => (
         <PostCard key={index} post={item.node}/>
        ))}
      </Masonry>
    </Box>
  )
}

// const itemData = [
//   {
//     img: 'https://images.unsplash.com/photo-1518756131217-31eb79b20e8f',
//     title: 'Fern',
//     content:'afadjkf janfldjanfjkn ajksdnfjndf jasdnfkjansdjkfnajnkj',
//   },
//   {
//     img: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f',
//     title: 'Snacks',
//     content:'affdf adjkff  ss233 anfldfdsf fjanfjkn asfjksdnfjndf jasdnfkjansdjkfnajnkj',
//   },
//   {
//     img: 'https://images.unsplash.com/photo-1597645587822-e99fa5d45d25',
//     title: 'Mushrooms',
//     content:'affdf adjkff  ss233 anfldfdsf f33najnkj fsd fkm123mlm1kl2 1, 2l232k32',
//   },
//   {
//     img: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383',
//     title: 'Tower',
//     content:'affdf adjkff  ss233 anfldfdsf f33najnkj fsd fkm123mlm1kl2 1, 2l232k32',
//   },
//   {
//     img: 'https://images.unsplash.com/photo-1471357674240-e1a485acb3e1',
//     title: 'Sea star',
//     content:'affdf adjkff  ss233 anfldfdsf fjanfjkn asfjksdnfjndf jasdnfkjansdjkfnajnkj',
//   },
//   {
//     img: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62',
//     title: 'Honey',
//     content:'affdf adjkff  ss233 anfldfdsf fjanfjkn asfjksdnfjndf jasdnfkjansdjkfnajnkj',
//   },
//   {
//     img: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6',
//     title: 'Basketball',
//     content:'afadjkf janfldjanfjkn ajksdnfjndf jasdnfkjansdjkfnajnkj',
//   },
//   {
//     img: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
//     title: 'Breakfast',
//     content:'afadjkf janfldjanfjkn ajksdnfjndf jasdnfkjaj 990ks0 dks fdf0s',
//   },
//   {
//     img: 'https://images.unsplash.com/photo-1627328715728-7bcc1b5db87d',
//     title: 'Tree',
//     content:'afadjkf12 ass11 12lkmklasdasajksdnfjndf jasdnfkjansdjkfnajnkj',
//   },
//   {
//     img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d',
//     title: 'Burger',
//     content:'aadfadf 12 122111 sdfs fjndf jasdnfkjansdjkfnajnkj',
//   },
//   {
//     img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
//     title: 'Camera',
//     content:'afadjkf janfldjanfjkn ajksdnfjndf jasdnfkjansdjkfnajnkj',
//   },
//   {
//     img: 'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c',
//     title: 'Coffee',
//   },
//   {
//     img: 'https://images.unsplash.com/photo-1627000086207-76eabf23aa2e',
//     title: 'Camping Car',
//   },
//   {
//     img: 'https://images.unsplash.com/photo-1533827432537-70133748f5c8',
//     title: 'Hats',
//   },
//   {
//     img: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af',
//     title: 'Tomato basil',
//   },
//   {
//     img: 'https://images.unsplash.com/photo-1627328561499-a3584d4ee4f7',
//     title: 'Mountain',
//   },
//   {
//     img: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6',
//     title: 'Bike',
//   },
// ];
