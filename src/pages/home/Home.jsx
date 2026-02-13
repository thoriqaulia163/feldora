import React from "react";
// import { useGetPosts } from "@lib/react-query/queries";
import { Helmet } from "react-helmet-async";
import Hero from "@components/Hero";
import PostCard from "../../components/Post/PostCard/PostCard";

export default function Home() {
  // const { data: posts, isPending: loading } = useGetPosts();
  // console.log(posts);

  // if (loading)
  //   return (
  //     <div>
  //       <Helmet>
  //         <title>Feldora | Home</title>
  //       </Helmet>
  //       Loading ....
  //     </div>
  //   );

  return (
    <div className="min-h-screen pt-16">
      <Helmet>
        <title>Feldora | Home</title>
      </Helmet>
      <Hero />
    </div>
  );
}
