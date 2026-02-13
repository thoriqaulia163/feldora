import React from "react";
import { useGetPosts } from "@lib/react-query/queries";
import { Helmet } from "react-helmet-async";
import PostCard from "../../components/Post/PostCard/PostCard";
import BlogHeroImage from "@assets/BlogHeroImage.webp";
import defaultAva from "@assets/avatar-default.svg";

export default function Blog() {
  const { data: posts, isPending: loading } = useGetPosts();
  console.log(posts);

  if (loading)
    return (
      <div>
        <Helmet>
          <title>Feldora | Home</title>
        </Helmet>
        Loading ....
      </div>
    );

  return (
    <div className="min-h-screen ">
      <Helmet>
        <title>Feldora | Home</title>
      </Helmet>
      <div className="bg-black px-4 pt-24 pb-8">
        <div className=" w-full max-w-5xl flex justify-center items-center gap-4 px-4 flex-col-reverse md:flex-row mx-auto">
          <div className="text-white w-full md:w-1/2 flex flex-col gap-4 ">
            <h2 className="font-light">Personal Statement</h2>
            <h1 className="hero-heading-xsmall special-font-full text-white">
              AI will controls nothing of me !!!
            </h1>
            <p className="font-mono text-[0.75rem] lg:text-[1rem]">
              AI is changing the web, and people want very different things from
              it. We’ve heard from many who want nothing to do with AI. We’ve
              also heard from others who want AI tools that are genuinely
              useful. Listening to our community, alongside our ongoing
              commitment to offer choice, led us to build AI controls. Starting
              ...
            </p>
          </div>

          <div className="w-full md:w-1/2 flex items-center">
            <img src={BlogHeroImage} className="aspect-[1080/720] w-full" />
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full max-w-5xl mx-auto gap-4 px-4 mt-8">
        {posts?.map((item, index) => (
          <PostCard key={index} post={item.node} />
        ))}
      </div>
    </div>
  );
}
