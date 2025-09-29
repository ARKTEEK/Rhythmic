import { useState } from "react";
import { FaApple, FaDeezer, FaPlus, FaSoundcloud, FaSpotify, FaYoutube } from "react-icons/fa";
import Window from "../../components/ui/Window.tsx";
import { googleOAuth } from "../../config/Config.ts";
import { Platform } from "../../models/Connection.ts";

export default function ConnectionsPage() {
  const [platforms] = useState<Platform[]>([
    {
      name: "Spotify",
      icon: FaSpotify,
      color: "bg-green-400",
      ribbonColor: "bg-green-200",
      windowColor: "bg-green-50",
      accounts: [
        { id: "1", username: "Username" },
        { id: "2", username: "Username" },
      ],
    },
    {
      name: "Apple Music",
      icon: FaApple,
      color: "bg-pink-500",
      ribbonColor: "bg-pink-200",
      windowColor: "bg-pink-50",
      accounts: [{ id: "1", username: "Username" }],
    },
    {
      name: "YouTube",
      icon: FaYoutube,
      color: "bg-red-400",
      ribbonColor: "bg-red-200",
      windowColor: "bg-red-50",
      accounts: [{ id: "1", username: "Username" }],
    },
    {
      name: "Deezer",
      icon: FaDeezer,
      color: "bg-purple-500",
      ribbonColor: "bg-purple-200",
      windowColor: "bg-purple-50",
      accounts: [],
    },
    {
      name: "SoundCloud",
      icon: FaSoundcloud,
      color: "bg-orange-500",
      ribbonColor: "bg-orange-200",
      windowColor: "bg-orange-50",
      accounts: [
        { id: "1", username: "Username" },
        { id: "2", username: "Username" },
      ],
    },
  ]);

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 gap-8 max-w-7xl mx-auto mt-8">
        { platforms.map((platform) => (
          <Window
            containerClassName={ "h-[380px] w-[400px]" }
            key={ platform.name }
            ribbonClassName={ platform.ribbonColor }
            windowClassName={ `${ platform.windowColor }` }>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={ `${ platform.color } p-3 box-style-md` }>
                  <platform.icon className="text-white text-2xl"/>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{ platform.name }</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      { platform.accounts.length } accounts
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4 flex-grow">
              { platform.accounts.length === 0 ? (
                <div
                  className="rounded-lg text-center text-gray-500 italic p-3 border-2
                             border-dashed border-brown-800 bg-white h-full flex
                             items-center justify-center">
                  No accounts connected
                </div>
              ) : (
                platform.accounts.map((account) => (
                  <div
                    key={ account.id }
                    className="box-style-md flex items-center justify-between p-3 border-2
                               border-brown-800 bg-white">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-brown-900">{ account.username }</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className="box-style-md px-4 py-1 rounded-full text-sm font-bold border-2
                                   border-brown-800 transition-all duration-200 transform bg-red-400
                                   hover:bg-red-500 text-white hover:cursor-pointer">
                        Disconnect
                      </button>
                    </div>
                  </div>
                ))
              ) }
            </div>

            <button
              className={ `box-style-md w-full py-3 border-2 border-brown-800 ${
                platform.ribbonColor || "bg-brown-200"
              } hover:opacity-80 transition-all duration-200 group hover:cursor-pointer 
                font-bold text-brown-900 mt-auto` }>
              <div
                className="flex items-center justify-center space-x-2"
                onClick={ googleOAuth }>
                <FaPlus className="text-brown-900"/>
                <span>Add Account</span>
              </div>
            </button>
          </Window>
        )) }
      </div>
    </div>
  );
};