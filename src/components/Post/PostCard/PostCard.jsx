import React from "react";
import { Link, Link as RouterLink } from "react-router-dom";
import { postDateTimeFormat } from "../../../utils/dateTimeFormater";

export default function PostCard({ post }) {
  return (
    <div className=" w-full min-h-48 border-2  border-purple-500 p-4 overflow-hidden flex rounded flex-col gap-4 sm:flex-row">
      <img
        className=" w-full h-auto sm:w-40 object-cover "
        srcSet={`${post.featuredImage.url}?w=162&auto=format&dpr=2 2x`}
        src={`${post.featuredImage.url}?w=162&auto=format`}
      />
      <div className=" flex flex-col w-full gap-2">
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
