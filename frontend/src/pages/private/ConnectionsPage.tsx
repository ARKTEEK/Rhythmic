import { useState } from "react";
import {
  FaSpotify,
  FaApple,
  FaDeezer,
  FaSoundcloud,
  FaPlus,
  FaYoutube
} from "react-icons/fa";
import { IconType } from "react-icons";

interface Account {
  id: string;
  username: string;
}

interface Platform {
  name: string;
  icon: IconType;
  color: string;
  accounts: Account[];
}

const ConnectionsPage = () => {
  const [platforms] = useState<Platform[]>([
    {
      name: "Spotify",
      icon: FaSpotify,
      color: "bg-green-400",
      accounts: [
        { id: "1", username: "Username" },
        { id: "2", username: "Username" }
      ],
    },
    {
      name: "Apple Music",
      icon: FaApple,
      color: "bg-pink-500",
      accounts: [
        { id: "1", username: "Username" }
      ],
    },
    {
      name: "YouTube",
      icon: FaYoutube,
      color: "bg-red-400",
      accounts: [
        { id: "1", username: "Username" }
      ],
    },
    {
      name: "Deezer",
      icon: FaDeezer,
      color: "bg-purple-500",
      accounts: [],
    },
    {
      name: "SoundCloud",
      icon: FaSoundcloud,
      color: "bg-orange-500",
      accounts: [
        { id: "1", username: "Username" },
        { id: "2", username: "Username" }
      ],
    },
  ]);

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 gap-8 max-w-7xl mx-auto mt-8">
        { platforms.map((platform) => (
          <div
            key={ platform.name }
            className="bg-[#ede0d0] rounded-lg p-6 shadow-[3px_3px_0_0_rgba(0,0,0,1)] border-4
                       border-black transform transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={ `${ platform.color } p-3 rounded-2xl border-2 border-black` }>
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

            <div className="space-y-3 mb-4">
              { platform.accounts.map((account) => (
                <div
                  key={ account.id }
                  className="flex items-center justify-between p-3 rounded-xl border-2 border-dashed
                             border-black">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-800">{ account.username }</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      className="px-4 py-1 rounded-full text-sm font-bold border-2 border-black
                                 transition-all duration-200 transform hover:scale-105 bg-red-400
                                 hover:bg-red-500 text-white">
                      Disconnect
                    </button>
                  </div>
                </div>
              )) }
            </div>

            <button
              className="w-full py-3 rounded-lg border-2 border-dashed border-gray-400 hover:from-yellow-200 hover:to-orange-200 transition-all duration-200 group">
              <div className="flex items-center justify-center space-x-2">
                <FaPlus className="text-gray-600 group-hover:text-black transition-colors"/>
                <span className="font-bold text-gray-700 group-hover:text-black transition-colors">
                    Add Account
                  </span>
              </div>
            </button>
          </div>
        )) }
      </div>
    </div>
  );
};

export default ConnectionsPage;