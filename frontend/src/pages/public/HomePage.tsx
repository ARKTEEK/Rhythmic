import {
  FaCopy,
  FaExchangeAlt,
  FaSearch,
  FaSync
} from 'react-icons/fa';
import { FaScissors } from 'react-icons/fa6';
import { Link } from "react-router-dom";
import Logo from "../../components/common/Logo.tsx";
import { FeatureCard } from "../../components/home/FeatureCard.tsx";
import Window from "../../components/ui/Window.tsx";

export default function HomePage() {
  return (
    <div className="min-h-screen w-full p-4 flex justify-center items-center">
      <div className="max-w-5xl w-full">
        <Window
          containerClassName="w-full min-h-[500px]"
          windowClassName="bg-stone-50"
          ribbonClassName="bg-stone-200">
          <div className="p-8 flex flex-col gap-6">
            <div className="text-center">
              <Logo
                size="lg"
                underline/>
              <div className="mt-8">
                <p className="text-gray-800 font-medium">Ready to get started?</p>
                <Link
                  to="/auth"
                  className="text-lg font-black underline decoration-2 underline-offset-4
                             hover:text-red-700 hover:decoration-red-700 transition-colors">
                  Create a new account
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeatureCard
                icon={ <FaExchangeAlt/> }
                title="Playlist Conversion"
                description="Convert playlists between platforms seamlessly."
                bgColor="bg-blue-50"
                iconBg="bg-blue-100"
                iconColor="text-blue-600"
              />
              <FeatureCard
                icon={ <FaCopy/> }
                title="Backup"
                description="Save snapshots and revert playlists easily."
                bgColor="bg-green-50"
                iconBg="bg-green-100"
                iconColor="text-green-600"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={ <FaScissors/> }
                title="Split"
                description="Split large playlists into smaller ones."
                bgColor="bg-purple-50"
                iconBg="bg-purple-100"
                iconColor="text-purple-600"
              />
              <FeatureCard
                icon={ <FaSearch/> }
                title="Duplicate Finder"
                description="Find and remove repeat tracks from your playlists."
                bgColor="bg-orange-50"
                iconBg="bg-orange-100"
                iconColor="text-orange-600"
              />
              <FeatureCard
                icon={ <FaSync/> }
                title="Sync"
                description="Synchronize playlists between platforms."
                bgColor="bg-yellow-50"
                iconBg="bg-yellow-100"
                iconColor="text-yellow-600"
              />
            </div>
          </div>
        </Window>
      </div>
    </div>
  );
}
