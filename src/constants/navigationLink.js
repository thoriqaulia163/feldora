import {
  faHouse,
  faPaintBrush,
  faBook,
  faCircleInfo,
  faNewspaper,
} from "@fortawesome/free-solid-svg-icons";

import { faGithub, faDiscord } from "@fortawesome/free-brands-svg-icons";


export const NAVIGATION_LINK = [
  {
    title: 'Home',
    link: '/',
    icon: faHouse,
  },
    {
    title: 'Canvas',
    link: '/canvas',
    icon: faPaintBrush,
  },
    {
    title: 'Log',
    link: '/log',
    icon: faBook,
  },
    {
    title: 'About',
    link: '/about',
    icon: faCircleInfo,
  },
    {
    title: 'Blog',
    link: '/blog',
    icon: faNewspaper,
  },
]

export const SOSMED_LINK = [
    {
    title: 'Discord',
    link: '#',
    icon: faDiscord,
    },
        {
    title: 'Discord',
    link: '#',
    icon: faGithub,
    },
]