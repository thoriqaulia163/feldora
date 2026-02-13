import React from "react";
import { Link, Link as RouterLink } from "react-router-dom";
import { postDateTimeFormat } from "../../../utils/dateTimeFormater";
// import Box from "@mui/material/Box";
// import Typography from "@mui/material/Typography";
// import Link from "@mui/material/Link";

export default function PostCard({ post }) {
  // return (
  //   <Box
  //     sx={{
  //       backdropFilter: 'blur(30px) saturate(200%)',
  //       borderRadius: '8px',
  //       boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.05), 0 20px 50px 0 rgba(0, 0, 0, 0.1)',
  //       backgroundColor: 'rgba(255,255,255,0.1)',
  //       overflow: 'hidden',
  //       transition: 'ease-in-out 0.2s',
  //       padding: '1rem',
  //       flex: { xs: '0 0 100%', sm: '0 0 calc(50% - 0.75rem)', md: '0 0 calc(33.3333% - 1rem)', lg: '0 0 calc(25% - 1.125rem)' },
  //       '::before': {
  //         position: 'fixed',
  //         content: '""',
  //         boxShadow: '0 0 100px 40px #ffffff28',
  //         top: '-10%',
  //         left: '-100%',
  //         transform: 'rotate(-45deg)',
  //         height: '60rem',
  //         transition: '.7s all',
  //       },
  //       '&:hover': {
  //         boxShadow: '0 0 0 2px rgb(244,245,247), 0 10px 60px 0 rgba(0, 0, 0, 0.1)',
  //         // transform: 'scale(1.015)',
  //         '::before': {
  //           filter: 'brightness(.5)',
  //           top: '-100%',
  //           left: '200%',
  //         }
  //       }
  //     }}
  //   >
  //     <img
  //       srcSet={`${post.featuredImage.url}?w=162&auto=format&dpr=2 2x`}
  //       src={`${post.featuredImage.url}?w=162&auto=format`}
  //       alt={post.title}
  //       style={{
  //         display: 'block',
  //         width: '100%',
  //         height: '200px',
  //         objectFit: 'cover',
  //         borderRadius: '8px',
  //       }}
  //     />
  //     <Box sx={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', height:'10rem',}}>
  //       <Typography variant='h5'>
  //         {post.title}
  //       </Typography>
  //       <Typography variant='body2'>
  //         {post.excerpt ? post.excerpt : '-'}
  //       </Typography>
  //     </Box>
  //     <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
  //       <Link
  //         component={RouterLink}
  //         to={`/post/${post.slug}`}
  //         sx={{
  //           marginTop:'1rem',
  //           textDecoration:'none',
  //           textAlign:'center',
  //           background: 'transparet',
  //           padding: '0.75rem 0.75rem',
  //           color: 'black',
  //           border:'3px solid black',
  //           borderRadius: '999px',
  //           width:'100%',
  //           transition: 'all .2s ease-in-out',
  //           '&:hover': {
  //             transform: 'scale(1.05)'

  //           },
  //         }}
  //       >
  //         Read More ...
  //       </Link>
  //     </Box>
  //   </Box>
  // )

  return (
    <div className=" w-full min-h-48 border-2 border-purple-500 p-4 overflow-hidden flex rounded">
      <img
        className=" h-40 w-40 object-cover"
        srcSet={`${post.featuredImage.url}?w=162&auto=format&dpr=2 2x`}
        src={`${post.featuredImage.url}?w=162&auto=format`}
      />
      <div className="pl-4 flex flex-col w-full gap-2">
        <h1 className=" font-mono font-bold text-xl ">{post.title}</h1>
        <h3 className="text-xs text-slate-700">
          {postDateTimeFormat(post.createdAt)}
        </h3>
        <p className="font-mono">{post.excerpt}</p>
        <Link
          to={`/post/${post.slug}`}
          className="text-customPurple-500 ml-auto self-end mt-auto bg-customYellow-200 p-2 font-bold font-mono"
        >
          Read More
        </Link>
      </div>
    </div>
  );
}
