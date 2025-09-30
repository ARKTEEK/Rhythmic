import { Platform } from "../models/Connection.ts";
import { FaApple, FaDeezer, FaGoogle, FaSoundcloud, FaSpotify, } from "react-icons/fa";
import {
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
    ribbonColor: "bg-green-200",
    windowColor: "bg-green-50",
    accounts: [],
  },
  {
    redirect: googleOAuth,
    name: "Google",
    icon: FaGoogle,
    color: "bg-red-500",
    ribbonColor: "bg-red-200",
    windowColor: "bg-red-50",
    accounts: [],
  },
  {
    redirect: deezerOAuth,
    name: "Deezer",
    icon: FaDeezer,
    color: "bg-purple-500",
    ribbonColor: "bg-purple-200",
    windowColor: "bg-purple-50",
    accounts: [],
  },
  {
    redirect: soundCloudOAuth,
    name: "SoundCloud",
    icon: FaSoundcloud,
    color: "bg-orange-500",
    ribbonColor: "bg-orange-200",
    windowColor: "bg-orange-50",
    accounts: [],
  },
  {
    redirect: appleOAuth,
    name: "Apple Music",
    icon: FaApple,
    color: "bg-pink-500",
    ribbonColor: "bg-pink-200",
    windowColor: "bg-pink-50",
    accounts: [],
  },
];
