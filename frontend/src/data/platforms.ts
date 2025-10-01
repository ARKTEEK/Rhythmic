import { Platform } from "../models/Connection.ts";
import { FaAmazon, FaApple, FaDeezer, FaGoogle, FaSoundcloud, FaSpotify, } from "react-icons/fa";
import {
  amazonOAuth,
  appleOAuth,
  deezerOAuth,
  googleOAuth,
  soundCloudOAuth,
  spotifyOAuth
} from "../config/Config.ts";

export const platforms: Platform[] = [
  {
    redirect: spotifyOAuth,
    name: "Spotify",
    icon: FaSpotify,
    color: "bg-green-400",
    ribbonColor: "bg-green-300",
    windowColor: "bg-green-50",
    accounts: [],
  },
  {
    redirect: googleOAuth,
    name: "Google",
    icon: FaGoogle,
    color: "bg-red-400",
    ribbonColor: "bg-red-300",
    windowColor: "bg-red-50",
    accounts: [],
  },
  {
    redirect: deezerOAuth,
    name: "Deezer",
    icon: FaDeezer,
    color: "bg-purple-400",
    ribbonColor: "bg-purple-300",
    windowColor: "bg-purple-50",
    accounts: [],
  },
  {
    redirect: soundCloudOAuth,
    name: "SoundCloud",
    icon: FaSoundcloud,
    color: "bg-orange-400",
    ribbonColor: "bg-orange-300",
    windowColor: "bg-orange-50",
    accounts: [],
  },
  {
    redirect: appleOAuth,
    name: "Apple Music",
    icon: FaApple,
    color: "bg-pink-400",
    ribbonColor: "bg-pink-300",
    windowColor: "bg-pink-50",
    accounts: [],
  },
  {
    redirect: amazonOAuth,
    name: "Amazon Music",
    icon: FaAmazon,
    color: "bg-yellow-400",
    ribbonColor: "bg-yellow-300",
    windowColor: "bg-yellow-50",
    accounts: [],
  }
];
