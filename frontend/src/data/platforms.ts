import { Platform } from "../models/Connection.ts";
import {
  FaGoogle,
  FaMusic,
  FaSoundcloud,
  FaSpotify,
} from "react-icons/fa";
import {
  googleOAuth,
  soundCloudOAuth,
  spotifyOAuth, tidalOAuth
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
    redirect: soundCloudOAuth,
    name: "SoundCloud",
    icon: FaSoundcloud,
    color: "bg-orange-400",
    ribbonColor: "bg-orange-300",
    windowColor: "bg-orange-50",
    accounts: [],
  },
  {
    redirect: tidalOAuth,
    name: "Tidal Music",
    icon: FaMusic,
    color: "bg-[#0ab2a5]",
    ribbonColor: "bg-[#26c2b8]",
    windowColor: "bg-[#e0f7f5]",
    accounts: [],
  },
];
